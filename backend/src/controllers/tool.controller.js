import prisma from '../prisma/client.js';
import sandboxService from '../services/sandbox.service.js';

/**
 * Test a custom tool's code in the sandbox without saving it
 */
export const testTool = async (req, res) => {
    try {
        const { code, input } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Code is required for testing' });
        }

        console.log('🧪 Testing custom tool in sandbox...');
        const result = await sandboxService.runTool(code, input || {});

        // Return the EXACT result directly as requested
        return res.status(200).json(result !== undefined ? result : null);
    } catch (error) {
        console.error('Test Tool Sandbox error:', error);
        // Returning 400 for logical/syntax errors to distinguish from server crashes
        res.status(400).json({ error: error.message });
    }
};

export const addTool = async (req, res) => {
    try {
        const { agentId, toolType, name, description, code } = req.body;
        const userId = req.user.id;

        const agent = await prisma.agent.findFirst({
            where: { id: agentId, userId }
        });

        if (!agent) {
            return res.status(404).json({ error: 'Agent not found or unauthorized' });
        }

        // Prevent duplicate tools (especially built-in)
        const existingTool = await prisma.tool.findFirst({
            where: {
                agentId,
                name: name
            }
        });

        if (existingTool) {
            return res.status(400).json({
                error: `Tool '${name}' is already added to this agent.`,
                message: `Tool '${name}' is already added to this agent.`
            });
        }

        const tool = await prisma.tool.create({
            data: {
                agentId,
                toolType,
                name,
                description,
                code: code || ""
            }
        });

        res.status(201).json(tool);
    } catch (error) {
        console.error('Add Tool error:', error);
        res.status(500).json({ error: 'Failed to add tool' });
    }
};

export const getToolsByAgent = async (req, res) => {
    try {
        const { agentId } = req.params;
        const userId = req.user.id;

        const agent = await prisma.agent.findFirst({
            where: { id: agentId, userId }
        });

        if (!agent) {
            return res.status(404).json({ error: 'Agent not found or unauthorized' });
        }

        const tools = await prisma.tool.findMany({
            where: { agentId }
        });

        res.json(tools);
    } catch (error) {
        console.error('Get Tools error:', error);
        res.status(500).json({ error: 'Failed to fetch tools' });
    }
};

export const deleteTool = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const tool = await prisma.tool.findUnique({
            where: { id },
            include: { agent: true }
        });

        if (!tool || tool.agent.userId !== userId) {
            return res.status(404).json({ error: 'Tool not found or unauthorized' });
        }

        // If it's a built-in tool, delete the associated API key
        if (tool.toolType === 'BUILT_IN') {
            const toolNameLower = tool.name.toLowerCase();
            let providerToDelete = null;

            // Map tool names to their provider names
            if (toolNameLower === 'tavily_search') {
                providerToDelete = 'tavily';
            } else if (toolNameLower === 'weather') {
                providerToDelete = 'weather'; // Will also check for 'openweathermap'
            }

            if (providerToDelete) {
                try {
                    // Try to delete the primary provider
                    const deleted = await prisma.apiKey.deleteMany({
                        where: {
                            userId,
                            provider: providerToDelete
                        }
                    });

                    // For weather, also try openweathermap
                    if (providerToDelete === 'weather') {
                        await prisma.apiKey.deleteMany({
                            where: {
                                userId,
                                provider: 'openweathermap'
                            }
                        });
                    }

                    if (deleted.count > 0) {
                        console.log(`✅ Deleted API key for provider: ${providerToDelete}`);
                    }
                } catch (deleteError) {
                    console.warn(`⚠️ Could not delete API key for ${providerToDelete}:`, deleteError.message);
                    // Continue with tool deletion even if API key deletion fails
                }
            }
        }

        await prisma.tool.delete({
            where: { id }
        });

        res.json({ message: 'Tool deleted successfully' });
    } catch (error) {
        console.error('Delete Tool error:', error);
        res.status(500).json({ error: 'Failed to delete tool' });
    }
};

export const updateTool = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, code } = req.body;
        const userId = req.user.id;

        const tool = await prisma.tool.findUnique({
            where: { id },
            include: { agent: true }
        });

        if (!tool || tool.agent.userId !== userId) {
            return res.status(404).json({ error: 'Tool not found or unauthorized' });
        }

        // If tool name is changing and it's a built-in tool, delete the old API key
        if (name && name !== tool.name && tool.toolType === 'BUILT_IN') {
            const oldToolNameLower = tool.name.toLowerCase();
            let providerToDelete = null;

            if (oldToolNameLower === 'tavily_search') {
                providerToDelete = 'tavily';
            } else if (oldToolNameLower === 'weather') {
                providerToDelete = 'weather';
            }

            if (providerToDelete) {
                try {
                    console.log(`🔄 Tool name changing from ${tool.name} to ${name}. Deleting old API key for ${providerToDelete}`);

                    await prisma.apiKey.deleteMany({
                        where: {
                            userId,
                            provider: providerToDelete
                        }
                    });

                    if (providerToDelete === 'weather') {
                        await prisma.apiKey.deleteMany({
                            where: {
                                userId,
                                provider: 'openweathermap'
                            }
                        });
                    }
                    console.log(`✅ Deleted old API key for provider: ${providerToDelete}`);
                } catch (deleteError) {
                    console.warn(`⚠️ Could not delete old API key for ${providerToDelete}:`, deleteError.message);
                }
            }
        }

        const updatedTool = await prisma.tool.update({
            where: { id },
            data: {
                name: name || tool.name,
                description: description || tool.description,
                code: code !== undefined ? code : tool.code
            }
        });

        res.json(updatedTool);
    } catch (error) {
        console.error('Update Tool error:', error);
        res.status(500).json({ error: 'Failed to update tool' });
    }
};
