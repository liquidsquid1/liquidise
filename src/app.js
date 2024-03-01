// .__  .__             .__    .___.__               
// |  | |__| ________ __|__| __| _/|__| ______ ____  
// |  | |  |/ ____/  |  \  |/ __ | |  |/  ___// __ \ 
// |  |_|  < <_|  |  |  /  / /_/ | |  |\___ \\  ___/ 
// |____/__|\__   |____/|__\____ | |__/____  >\___  >
//             |__|             \/         \/     \/ 
//
// a general purpose headless minecraft bot written in javascript

const mineflayer = require('mineflayer');
const minecraftHawkEye = require('minecrafthawkeye');
const mineflayerViewer = require('prismarine-viewer').mineflayer;
const mineflayerArmorManager = require('mineflayer-armor-manager');
const mineflayerDashboard = require('mineflayer-dashboard');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const { GoalNear, GoalFollow } = require('mineflayer-pathfinder').goals;
const path = require('path');

let botUsername = "liquidise0";

let mcData;

let config = require(path.join(".", "..", "config", "config.json"));

// settings, the code becomes unreadable from here :3
let rotations = config.default_modules.rotations;
let killAura = config.default_modules.killAura;
let fightBot = config.default_modules.fightBot;
let bowBot = config.default_modules.bowBot;

function createNewBot(user) {
    
    const bot = mineflayer.createBot({
        host: config.connection.server,
        port: config.connection.port,
        auth: "offline",
        username: user,
        checkTimeoutInterval: 2147483646, // This is *awful*, but hack around some upstream bugs related to timeouts https://github.com/PrismarineJS/mineflayer/issues/3292
                                          // This means the bot will take an entire 2 and a half weeks to time out from a server, but thats funny so I don't care - luna
        plugins: [
            mineflayerDashboard, 
            pathfinder, 
            mineflayerArmorManager,
            minecraftHawkEye
        ],
    });

    bot.on('spawn', () => {

        mcData = require('minecraft-data')(bot.version);

        // change logging
        global.console.log = bot.dashboard.log;
        global.console.warn = bot.dashboard.log;
        global.console.error = bot.dashboard.log;

        // define movements
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

        botMovements.scafoldingBlocks = [ mcData.itemsByName.stone.id, mcData.itemsByName.oak_planks.id ]

        bot.pathfinder.setMovements(botMovements);

        // add commands to dashboard
        readyCommands(bot);

        // require('child_process').exec('start http://localhost:8080/'); // OPENING VIEWER - THIS ISNT MALWARE
    })

    bot.on('physicsTick', () => {
        if (killAura) {
            killauraTick(bot, config.combat.reach);
        }
        if (fightBot) {
            fightBotTick(bot, config.combat.reach);
        }
    })

    bot.on("kicked", console.log);
    bot.on("chat", (username, message) => {
        bot.dashboard.log(`${username}: ${message}`);
    });
}

function locateNearestPlayer(bot) {
    let mobFilter = (e) => e.type === config.combat.target;
    let player = bot.nearestEntity(mobFilter);
    return player;
}

function killauraTick(bot, range) {
    entity = locateNearestPlayer(bot);
    if (!entity) { return; }
    let pos = entity.position.offset(0, entity.height, 0);

    if (bot.entity.position.distanceTo(entity.position) > range) { return; }
    if (rotations) { bot.lookAt(pos, true); }
    bot.attack(entity);
    return entity;
}

function fightBotTick(bot, range) {
    killauraTick(bot, range);

    entity = locateNearestPlayer(bot);
    if (!entity) { return; }

    bot.pathfinder.setGoal(new GoalFollow(entity, range));
}

function readyCommands(bot) {
    bot.dashboard.commands['coords'] = () => {
        console.log("current x: " + bot.entity.position.x);
        console.log("current y: " + bot.entity.position.y);
        console.log("current z: " + bot.entity.position.z);
    }
    bot.dashboard.commands['drop'] = () => {
        if (bot.inventory.items().length === 0) {
            console.log("the bot has no items in it's inventory for it to drop");
            return;
        }
        console.log("successfully dropped " + bot.inventory.items()[0].displayName);
        bot.tossStack(bot.inventory.items()[0]);
    }
    bot.dashboard.commands['navigate'] = (x, y, z) => {
        console.log("navigating");
        bot.pathfinder.setGoal(new GoalNear(x, y, z));
    }
    bot.dashboard.commands['killaura'] = () => {
        killAura = !killAura;
        console.log("killaura: " + killAura);
    }
    bot.dashboard.commands['rotations'] = () => {
        rotations = !rotations;
        console.log("rotations: " + rotations);
    }
    bot.dashboard.commands['fightbot'] = () => {
        fightBot = !fightBot;
        console.log("fightbot: " + fightBot);
    }
    bot.dashboard.commands['bowbot'] = () => {
        bowBot = !bowBot;
        console.log("bowbot: " + bowBot);
        if (bowBot) {
            bot.hawkEye.autoAttack(locateNearestPlayer(), 'bow');
        } else {
            bot.hawkEye.stop();
        }
    }
    bot.dashboard.commands['web'] = (port) => {
        mineflayerViewer(bot, {
            viewDistance: 4,
            firstPerson: false,
            port: port
        })
    }
    bot.dashboard.commands['vclip'] = (dist) => {
        bot.entity.position = bot.entity.position.offset(0, parseInt(dist), 0);
    }
}

createNewBot(config.connection.username);
