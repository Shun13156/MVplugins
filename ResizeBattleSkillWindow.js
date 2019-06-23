/*:ja
 * @plugindesc 戦闘時のスキルウィンドウ（アイテムウィンドウ）の表示位置とサイズを変更するプラグインです。
 * @author Resize Skill Window
 *
 * @help 
 * このプラグインにはプラグインコマンドはありません。
 * 
 * Margin パラメータについて
 * CSS marginと同様の書式でウィンドウサイズを変更できます。
 * 値を1つ指定した場合：	指定した値が[上下左右]のマージンになります。
 * 値を2つ指定した場合：	記述した順に[上下][左右]のマージンになります。
 * 値を3つ指定した場合：	記述した順に[上][左右][下]のマージンになります。
 * 値を4つ指定した場合：	記述した順に[上][右][下][左]のマージンになります。
 * 
 * @param HideHelpWindow
 * @desc ヘルプウィンドウの表示/非表示
 * @type boolean
 * @on はい
 * @off いいえ
 * @default false
 * 
 * @param HideStatusWindow
 * @desc ステータスウィンドウの表示/非表示
 * @type boolean
 * @on はい
 * @off いいえ
 * @default false
 * 
 * @param Margin
 * @desc ウィンドウのマージンを設定
 * @type Number[]
 * @default ["0"]
 */

(function() {
'use strict'

    function toBoolean (data) {
        return data.toLowerCase() === 'true';
    }

    function getMargin(){
        switch(margin.length){
            case 0: return  [0,0,0,0];
            case 1: return  [margin[0],margin[0],margin[0],margin[0]];
            case 2: return  [margin[1],margin[0],margin[1],margin[0]];
            case 3: return  [margin[1],margin[0],margin[1],margin[2]];
            default: return  [margin[3],margin[0],margin[1],margin[2]];
        }
    }

    var parameters = PluginManager.parameters('ResizeBattleSkillWindow');
    var isHideHelp = toBoolean(parameters['HideHelpWindow']);
    var isHideStatus = toBoolean(parameters['HideStatusWindow']);
    var margin = JSON.parse(parameters['Margin']).map(element => parseInt(element));
    
    Scene_Battle.prototype.createHelpWindow = function() {
        this._helpWindow = new Window_Help();
        this._helpWindow.visible = false;
        this.addWindow(this._helpWindow);

        if(isHideHelp)
        {
            this._helpWindow.move(0,0,0,0);
        }
        else
        {
            var hw = this._helpWindow;
            var [x1,y1,x2] = getMargin();     
            hw.move(hw.x + x1, hw.y + y1, hw.width - (x1+x2), hw.height);
        }

    };

    var _Scene_Battle_CommandSkill = Scene_Battle.prototype.commandSkill;
    Scene_Battle.prototype.commandSkill = function() {
        _Scene_Battle_CommandSkill.call(this)

        if(isHideHelp) this._skillWindow.hideHelpWindow();

        if(isHideStatus){
            this._statusWindow.hide();
            this._actorCommandWindow.hide();
        }
    };
    

    var _Scene_Battle_OnSkillOk = Scene_Battle.prototype.onSkillOk;
    Scene_Battle.prototype.onSkillOk = function() {
        _Scene_Battle_OnSkillOk.call(this);
        if(isHideStatus){
            this._statusWindow.show();
            this._actorCommandWindow.show();
        }
    };

    var _Scene_Battle_OnSkillCancel = Scene_Battle.prototype.onSkillCancel;
    Scene_Battle.prototype.onSkillCancel = function() {
        _Scene_Battle_OnSkillCancel.call(this);

        if(isHideStatus){
            this._statusWindow.show();
            this._actorCommandWindow.show();
        }
    };

    var _Scene_Battle_CommandItem = Scene_Battle.prototype.commandItem;
    Scene_Battle.prototype.commandItem = function() {
        _Scene_Battle_CommandItem.call(this);

        if(isHideHelp) this._skillWindow.hideHelpWindow();

        if(isHideStatus){
            this._statusWindow.hide();
            this._actorCommandWindow.hide();
        }

    };

    var _Scene_Battle_OnItemOK = Scene_Battle.prototype.onItemOk;
    Scene_Battle.prototype.onItemOk = function() {
        _Scene_Battle_OnItemOK

        if(isHideStatus){
            this._statusWindow.show();
            this._actorCommandWindow.show();
        }
    };

    var _Scene_Battle_OnItemCancel = Scene_Battle.prototype.onItemCancel;
    Scene_Battle.prototype.onItemCancel = function() {
        _Scene_Battle_OnItemCancel.call(this);

        if(isHideStatus){
            this._statusWindow.show();
            this._actorCommandWindow.show();
        }
    };

    var Window_BattaleSkill_Initialize = Window_BattleSkill.prototype.initialize;
    Window_BattleSkill.prototype.initialize = function(x, y, width, height) {

        if(isHideStatus) height = Graphics.boxHeight - y;
        Window_BattaleSkill_Initialize.call(this,x, y, width, height);
        this.setMargin();

    };

    Window_BattleSkill.prototype.setMargin = function(){
        
        var [x1,y1,x2,y2] = getMargin();
        if(isHideHelp)
        {
            this.move(this.x + x1, this.y + y1, this.width - (x1+x2), this.height - (y1+y2));
        }
        else
        {
            this.move(this.x + x1, this.y, this.width - (x1+x2), this.height - y2);
        }
    }

    var Window_BattaleSkill_Initialize = Window_BattleItem.prototype.initialize;
    Window_BattleItem.prototype.initialize = function(x, y, width, height) {

        if(isHideStatus) height = Graphics.boxHeight - y;
        Window_BattaleSkill_Initialize.call(this,x, y, width, height);
        this.setMargin();

    };

    Window_BattleItem.prototype.setMargin = function(){
        Window_BattleSkill.prototype.setMargin.call(this);
    }

})();