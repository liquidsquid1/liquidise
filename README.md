<h1 align="center">liquidise</h1>
<p align="center">general purpose headless minecraft bot written in javascript</p>
<p align="center">
    <img src="https://skillicons.dev/icons?i=js,nodejs,npm" />
</p>

## dependencies:
- nodejs (v20 LTS)
- npm in system path
- a competent wifi connection
- a microsoft account (if using MS auth)

## how to install
download the latest release from the releases tab. open that up, double click the tools folder and run `install_dependencies.bat` to install the required dependencies.

windows smartscreen may appear, just click "More Info" and "Run Anyway". this is because microsoft immediately doesn't trust files that haven't paid them or another greedy corporation some money.

once it's done installing, the window will automatically close. run `start_bot.bat` to start the bot.

## how to navigate the dashboard
the dashboard contains two things: "modes" and "commands".

### modes
modes are the different sections of the bot where whatever you type directly interacts with the bot.

going into chat mode (`:chat`) lets you type messages and hit enter to send, whereas the repl mode (`:repl`) lets you run javascript code in the bot.

### commands
running `:help` shows the list of commands. commands take arguments, which are not shown in the help command.

for example:
```
.navigate -1039 69 8392
.vclip 5
.fightbot (togglable)
```

### how to close the bot
hitting ctrl+c terminates the bot, and ctrl+c again terminates the dashboard.

### credits:
```
liquidsquid1 - main development
lunakittyyy - contributor (and helped test)
```