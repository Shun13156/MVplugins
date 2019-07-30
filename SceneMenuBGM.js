//=============================================================================
// SceneMenuBGM
// ----------------------------------------------------------------------------
// (C)2018 Shun
// ----------------------------------------------------------------------------
// Version 1.0.0
// 
// ----------------------------------------------------------------------------
//=============================================================================

/*:
 * @plugindesc メニュー画面のBGMを設定するプラグイン
 * @author Shun
 * 
 * @help
 * パラメータ
 * AudioParamaters
 * name   :BGMを指定します。
 * volume :BGMの音量を指定します。
 * pitch  :BGMのピッチを指定します。
 * pan    :BGMの位相を指定します。
 * 
 * プラグインコマンド
 * SET_MENU_BGM BGM ボリューム ピッチ 位相：BGMを変更します。すべてのパラメータを指定します。
 * SET_MENU_BGM_NAME BGM ：BGMを変更します。何も指定しない場合BGMが流れなくなります。
 * SET_MENU_BGM_VOLUME ボリューム ：BGMのボリュームを変更します。
 * SET_MENU_BGM_PITCH ピッチ ：BGMのピッチを変更します。
 * SET_MENU_BGM_PAN 位相 ：BGMの位相を変更します。
 * 
 * @param AudioParamaters
 * @type struct<AudioParamaters>
 * 
 * @param FadeIn
 * @default 1
 * @type number
 * @decimals 1
 * @desc BGMが切り替わる際のフェード時間（秒）を指定します。
 * 
 * @param Resume
 * @default true
 * @type bool
 * @desc メニューを開く直前の状態から再生を開始するかどうかを指定します。
 */
 
/*~struct~AudioParamaters:
 * @param name
 * @type string
 * @default Theme1
 * @desc BGM名を指定します。
 * 
 * @param volume
 * @type number
 * @min 0
 * @max 100
 * @default 90
 * @desc ボリュームを指定します。
 * 
 * @param pitch
 * @type number
 * @min 0
 * @max 200
 * @default 100
 * @desc ピッチを指定します。
 * 
 * @param pan
 * @type number
 * @min -150
 * @max 150
 * @default 0
 * @desc 位相を指定します。
 * 
*/


(function() {
    'use strict';

AudioManager.resumeAudio = null;

function parseStrToBoolean(str) {
    return (str == 'true') ? true : false;

};

var parameters = PluginManager.parameters('SceneMenuBGM');
var AudioParamaters  = JSON.parse(parameters['AudioParamaters'])
var FadeIn  = parseFloat(parameters['FadeIn'])
var Resume =  parseStrToBoolean(parameters['Resume'])

var getCommandName = function(command) {
    return (command || '').toUpperCase();
};

var _Game_Sytem_Initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    _Game_Sytem_Initialize.call(this);
    this._menuBgm = {
        name   : AudioParamaters.name,
        volume : AudioParamaters.volume,
        pitch  : AudioParamaters.pitch,
        pan    : AudioParamaters.pan,
        pos    : 0
    }
}

//=============================================================================
// Game_Interpreter
//  プラグインコマンドを追加定義します。
//=============================================================================
var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.apply(this, arguments);
    this.pluginCommandSceneMenuBGM(command, args);
};

Game_Interpreter.prototype.pluginCommandSceneMenuBGM = function(command, args) {
    switch (getCommandName(command)) {
        case 'SET_MENU_BGM' :
                $gameSystem._menuBgm = {
                    name: args[0],
                    volume: args[1],
                    pitch: args[2],
                    pan: args[3],
                    pos: 0
                };
            break;

        case 'SET_MENU_BGM_NAME' :
            if (args.length > 0) $gameSystem._menuBgm.name = args[0]
            else $gameSystem._menuBgm.name = ''
            break;

        case 'SET_MENU_BGM_VOLUME':
            if (args.length > 0) $gameSystem._menuBgm.volume = args[0]
            else $gameSystem._menuBgm.volume = 0
            break;

        case 'SET_MENU_BGM_PITCH':
            if (args.length > 0) $gameSystem._menuBgm.pitch = args[0]
            else $gameSystem._menuBgm.pitch = 100
            break;
            
        case 'SET_MENU_BGM_PAN':
            if (args.length > 0) $gameSystem._menuBgm.pan = args[0]
            else $gameSystem._menuBgm.pitch = 0
            break;

    }
};


var _Scene_Map_callMenu = Scene_Map.prototype.callMenu;
Scene_Map.prototype.callMenu = function() {
    _Scene_Map_callMenu.call(this);

    if(!AudioManager._currentBgm) return;

    AudioManager._resumeBgm = AudioManager.saveBgm();
    if(!Resume) AudioManager._resumeBgm.pos = 0;

    AudioManager.stopAll();

    if($gameSystem._menuBgm.name === '') return;
    AudioManager.playBgm($gameSystem._menuBgm,0)
    AudioManager.fadeInBgm(FadeIn);
};


var _Scene_Menu_popScene = Scene_Menu.prototype.popScene;
Scene_Menu.prototype.popScene = function() {
    _Scene_Menu_popScene.call(this);
    if(SceneManager._nextScene.constructor === Scene_Map)
    {
        AudioManager.stopAll();
        if(AudioManager._resumeBgm.name === '') return;
        
        AudioManager.playBgm(AudioManager._resumeBgm,AudioManager._resumeBgm.pos);
        AudioManager.fadeInBgm(FadeIn);
    }
};

var _Scene_GameEnd_commandToTitle = Scene_GameEnd.prototype.commandToTitle
Scene_GameEnd.prototype.commandToTitle = function() {
    AudioManager._resumeBgm = null;
    _Scene_GameEnd_commandToTitle.call(this);
};

var _Scene_Save_OnSavefileOk = Scene_Save.prototype.onSavefileOk;
Scene_Save.prototype.onSavefileOk = function() {
    var temp = AudioManager._currentBgm;
    AudioManager._currentBgm = AudioManager._resumeBgm;

    _Scene_Save_OnSavefileOk.call(this)
    AudioManager._currentBgm = temp;

};


})();