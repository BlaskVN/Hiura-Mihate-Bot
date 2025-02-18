const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            if (folder === 'admin') {
                command.data.setDefaultMemberPermissions(0x00000008);
            }
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] ${filePath} không có data hoặc execute!`);
        }
    }
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        // console.log('Đang xóa các lệnh cũ...');

        // await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
        
        console.log(`Bắt đầu tải ${commands.length} lệnh...`);
        
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`Tải lệnh global thành công! ${data.length} lệnh đã được tải.`);
        
        // await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: [] });

        // const guildData = await rest.put(
        //     Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        //     { body: commands },
        // );

        // console.log(`Tải lệnh guild thành công! ${guildData.length} lệnh đã được tải.`);
    } catch (error) {
        console.error(error);
    }
})();