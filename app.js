// .__  .__             .__    .___.__               
// |  | |__| ________ __|__| __| _/|__| ______ ____  
// |  | |  |/ ____/  |  \  |/ __ | |  |/  ___// __ \ 
// |  |_|  < <_|  |  |  /  / /_/ | |  |\___ \\  ___/ 
// |____/__|\__   |____/|__\____ | |__/____  >\___  >
//             |__|             \/         \/     \/ 
//
// a general purpose headless minecraft bot written in javascript

const mineflayer = require('mineflayer');
const mineflayerViewer = require('prismarine-viewer').mineflayer;
const mineflayerPVP = require('mineflayer-pvp').plugin;
const mineflayerArmorManager = require('mineflayer-armor-manager');
const mineflayerCollectBlock = require('mineflayer-collectblock').plugin;
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const { GoalNear, GoalFollow } = require('mineflayer-pathfinder').goals;

const prefix = "l!";
const botUsername = "liquidise0";

let mcData;

function createNewBot(user) {
    const bot = mineflayer.createBot({
        host: "localhost",
        port: 25565,
        auth: "offline",
        username: user
    });
    
    bot.on('spawn', () => {
    
        bot.loadPlugin(pathfinder);
        bot.loadPlugin(mineflayerPVP);
        bot.loadPlugin(mineflayerArmorManager);
        bot.loadPlugin(mineflayerCollectBlock);

        mcData = require('minecraft-data')(bot.version);

        // const mcData = require('minecraft-data')(bot.version)
        let botMovements = new Movements(bot);
        botMovements.canDig = true;
        botMovements.canOpenDoors = true;
        botMovements.dontMineUnderFallingBlock = true;
        botMovements.allow1by1towers = true;
        botMovements.allowEntityDetection = false;
        botMovements.allowFreeMotion = true;
        botMovements.allowParkour = true;
        botMovements.allowSprinting = true;
        botMovements.maxDropDown = 4;
        // commence the wool!
        botMovements.scafoldingBlocks.push(bot.registry.itemsByName['white_wool'].id);
        botMovements.scafoldingBlocks.push(bot.registry.itemsByName['light_gray_wool'].id);
        botMovements.scafoldingBlocks.push(bot.registry.itemsByName['gray_wool'].id);
        botMovements.scafoldingBlocks.push(bot.registry.itemsByName['black_wool'].id);
        botMovements.scafoldingBlocks.push(bot.registry.itemsByName['brown_wool'].id);
        botMovements.scafoldingBlocks.push(bot.registry.itemsByName['red_wool'].id);
        botMovements.scafoldingBlocks.push(bot.registry.itemsByName['orange_wool'].id);
        botMovements.scafoldingBlocks.push(bot.registry.itemsByName['yellow_wool'].id);
        botMovements.scafoldingBlocks.push(bot.registry.itemsByName['lime_wool'].id);
        botMovements.scafoldingBlocks.push(bot.registry.itemsByName['green_wool'].id);
        botMovements.scafoldingBlocks.push(bot.registry.itemsByName['cyan_wool'].id);
        botMovements.scafoldingBlocks.push(bot.registry.itemsByName['light_blue_wool'].id);
        botMovements.scafoldingBlocks.push(bot.registry.itemsByName['blue_wool'].id);
        botMovements.scafoldingBlocks.push(bot.registry.itemsByName['purple_wool'].id);
        botMovements.scafoldingBlocks.push(bot.registry.itemsByName['magenta_wool'].id);
        botMovements.scafoldingBlocks.push(bot.registry.itemsByName['pink_wool'].id);

        bot.pathfinder.setMovements(botMovements);
    
        // UNCOMMENT FOR WEB SERVER!
        // mineflayerViewer(bot, {
        //     viewDistance: 4,
        //     firstPerson: false,
        //     port: 8080
        // });
    });
    bot.on('chat', (username, message) => {
        if (username == bot.username) return;
        if (!message.startsWith(prefix)) return;
        let c = message.slice(2);
        let commandArray = c.split(" ");
        
        switch(commandArray[0]) {
            case "hello":
                bot.chat("hi");
                break
            case "echo":
                let echoParams = commandArray.shift();
                bot.chat(commandArray.join(" "));
                break
            case "navigate":
                bot.chat("Navigating!");
                bot.pathfinder.setGoal(new GoalNear(commandArray[1], commandArray[2], commandArray[3], 1));
                break
            case "navigate.target":
                if (!bot.players[commandArray[1]]) {
                    bot.chat("That's not a valid player!");
                    return
                }
                if (bot.players[commandArray[1]] == bot.player) {
                    bot.chat("Hey, that's me!");
                    return
                }
                bot.chat("Navigating!");
                p = bot.players[commandArray[1]].entity.position;
                bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 1));
                break
            case "coords":
                p = bot.entity.position;
                bot.chat("X: " + p.x + " Y: " + p.y + " Z: " + p.z);
                break
            case "fight.target":
                if (!bot.players[commandArray[1]]) {
                    bot.chat("That's not a valid player!");
                    return
                }
                if (bot.players[commandArray[1]] == bot.player) {
                    bot.chat("Hey, that's me!");
                    return
                }
                bot.chat("Now fighting " + bot.players[commandArray[1]].username);
                bot.pvp.attack(bot.players[commandArray[1]].entity);
                break
            case "fight.stop":
                bot.chat("No longer fighting.");
                bot.pvp.stop();
                break
            case "drop":
                if (bot.inventory.items().length === 0) {
                    bot.chat("I don't have any other items!");
                    return
                };
                bot.chat("Successfully dropped " + bot.inventory.items()[0].displayName);
                bot.tossStack(bot.inventory.items()[0]);
                break;
            case "armor":
                bot.chat("Instantly equipped armor!");
                bot.armorManager.equipAll();
                break
            case "bed":
                bot.chat("Breaking bed!");
                const bed = bot.findBlock({
                    matching: mcData.blocksByName.red_bed.id,
                    maxDistance: 64
                });
                bot.collectBlock.collect(bed);
                break
            default:
                bot.chat("Invalid command!");
                console.log(username + " has sent an invalid command");
                break
        };
    });
    
    bot.on("kicked", console.log);
}

createNewBot(botUsername);