//=============================================================================
// FindDirection.js
// ----------------------------------------------------------------------------
// (C) 2021 Shun / inazuma_soft
// ----------------------------------------------------------------------------

/*:ja
 * @plugindesc A*アルゴリズムの実装練習
 * @author Shun / inazumasoft
 *
 * @help 
 * A*アルゴリズムの理解を深めるために
 * 既存の下記メソッドを再実装したプラグイン
 * CharacterBase.prototype.findDirectionTo
 * 
 * 
 *
 * 参考URL
 * https://yttm-work.jp/algorithm/algorithm_0015.html
 */

class ExplorationNode {
    constructor(x, y) {
        this._x = x;
        this._y = y;
        /**
         * @type {ExplorationNode}
         */
        this._parent = null;
        this._heuristicCost = 0;
        this._moveCost = $gameMap.regionId(x, y) || Infinity;
        this._costToStart = 0;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get parent() {
        return this._parent;
    }
    set parent(value) {
        this._parent = value;
    }
    get totalCost() {
        return this._heuristicCost + this._costToStart;
    }
    get heuristicCost() {
        return this._heuristicCost;
    }
    get moveCost() {
        return this._moveCost;
    }
    get costToStart() {
        return this._costToStart;
    }
    set costToStart(value) {
        this._costToStart += value;
    }
    /**
     * @param {ExplorationNode} node 
     */
    equal(node) {
        return this._x === node.x && this._y === node.y;
    }
    setGoal(node) {
        this._heuristicCost = $gameMap.distance(this._x, this._y, node.x, node.y);
    }
    closer(node) {
        return this._heuristicCost < node.heuristicCost ? this : node;
    }
}

class WeightedGraph {
    constructor() {
        /**
         * @type {Array<Array<ExplorationNode>>}
         */
        this._data = [];
        /**
         * @type {ExplorationNode}
         */
        this._goalNode = null;
        const width = $gameMap.width();
        const height = $gameMap.height();

        //隣接を取得する際に新しいノードを作成しているのであんまり意味がない
        //csv等から初期化するなら必要かも
        for (let x = 0; x < width; x++) {
            this._data.push([]);
            for (let y = 0; y < height; y++) {
                this._data[x][y] = new ExplorationNode(x, y);
            }
        }
    }

    initCost(goalNode) {
        this._goalNode = goalNode;
        this._data.forEach(nodes => {
            nodes.forEach(node =>
                node.setGoal(this._goalNode))
        });
    }

    node(x, y) {
        x = Math.max(x, 0);
        x = Math.min(x, $gameMap.width() - 1);
        y = Math.max(y, 0);
        y = Math.min(y, $gameMap.height() - 1);
        return this._data[x][y];
    }

    adjacentNodes(node) {
        const adjNodes = [];
        const adjPos = [
            { x: node.x, y: node.y + 1 },
            { x: node.x - 1, y: node.y },
            { x: node.x + 1, y: node.y },
            { x: node.x, y: node.y - 1 }
        ]
        for (let i = 0; i < 4; i++) {
            const adjNode = new ExplorationNode(adjPos[i].x, adjPos[i].y);
            adjNode.setGoal(this._goalNode);
            adjNodes.push(adjNode);
        }
        return adjNodes.filter(node => node);
    }
}

class RouteExploration {
    constructor(graph) {
        /**
         * @type {WeightedGraph}
         */
        this._graph = graph;
        /**
         * @type {Array<ExplorationNode>}
         */
        this._openList = [];
        /**
         * @type {Array<ExplorationNode>}
         */
        this._closedList = [];
        /**
        * @type {Array<ExplorationNode>}
        */
        this._route = [];
        /**
         * @type {ExplorationNode}
         */
        this._startNode = null;
        this._goalNode = null;
    }

    findDirection(x, y) {
        const postion = this._route.shift();
        if (postion) {
            var deltaX1 = $gameMap.deltaX(postion.x, x);
            var deltaY1 = $gameMap.deltaY(postion.y, y);
            if (deltaY1 > 0) {
                return 2;
            } else if (deltaX1 < 0) {
                return 4;
            } else if (deltaX1 > 0) {
                return 6;
            } else if (deltaY1 < 0) {
                return 8;
            }

            var deltaX2 = $gamePlayer.deltaXFrom(this._goalNode.x);
            var deltaY2 = $gamePlayer.deltaYFrom(this._goalNode.y);
            if (Math.abs(deltaX2) > Math.abs(deltaY2)) {
                return deltaX2 > 0 ? 4 : 6;
            } else if (deltaY2 !== 0) {
                return deltaY2 > 0 ? 8 : 2;
            }
        }
        return 0;
    }

    /**
     * 
     * @param {ExplorationNode} startNode 
     * @param {ExplorationNode} goalNode 
     */
    start(startNode, goalNode) {
        this._startNode = startNode;
        this._goalNode = goalNode;
        this._graph.initCost(goalNode);
        this._openList.push(startNode);

        let closerNode = startNode;

        while (this._openList.length > 0) {
            const currentNode = this.minimumCostNode();

            if (goalNode.equal(currentNode)) {
                break;
            }

            closerNode = closerNode.closer(currentNode);
            this.addAdjacentNodeToOpenList(currentNode);
        }

        if (this.isNotFound()) {
            this._route.unshift(closerNode);
        }
        else {
            this._route.unshift(this._closedList.pop());
        }

        if (this._route[0].equal(startNode)) {
            return;
        }

        while (!this._route[0].parent.equal(startNode)) {
            this._route.unshift(this._route[0].parent);
        }
    }

    /**
     * @param {ExplorationNode} newNode 
     */
    minimumCostNode() {
        //const minNode = this._openList.reduce((a, b) => a.totalCost < b.totalCost ? a : b);
        //this._openList.sort((a, b) => a.totalCost - b.totalCost)
        const minNode = this._openList.shift();
        this._closedList.push(minNode);
        return minNode;
    }

    /**
     * @param {ExplorationNode} newNode 
     */
    updateCloseList(newNode) {
        const oldNode = this._closedList.find(
            node => node.equal(newNode)
        );
        if (newNode.totalCost < oldNode.totalCost) {
            const index = this._closedList.indexOf(oldNode);
            this._closedList.splice(index, 1);
            this.addNodeToOpenList(newNode);
        }
    }

    /**
     * @param {ExplorationNode} newNode 
     */
    updateOpenList(newNode) {
        const oldNode = this._openList.find(
            node => node.equal(newNode)
        );
        if (newNode.totalCost < oldNode.totalCost) {
            const index = this._openList.indexOf(oldNode);
            this._openList.splice(index, 1);
            this.addNodeToOpenList(newNode);
        }
    }

    //オープンリストの最適な位置へ挿入する
    addNodeToOpenList(node) {
        let i;
        for (i = 0; i < this._openList.length; i++) {
            if (node.totalCost <= this._openList[i].totalCost) {
                break;
            }
        }
        this._openList.splice(i, 0, node);
    }

    //未探査の隣接ノードをオープンリストに追加する
    /**
     * @param {ExplorationNode} curNode 
     */
    addAdjacentNodeToOpenList(curNode) {
        const adjNodes = this._graph.adjacentNodes(curNode);
        for (let i = 0; i < adjNodes.length; i++) {
            adjNodes[i].costToStart = adjNodes[i].moveCost + curNode.costToStart;
            if (adjNodes[i].totalCost === Infinity) {
                continue;
            }
            adjNodes[i].parent = curNode;
            if (this.isInCloseList(adjNodes[i])) {
                this.updateCloseList(adjNodes[i]);
                continue;
            }
            if (this.isInOpenList(adjNodes[i])) {
                this.updateOpenList(adjNodes[i]);
                continue;
            }
            this.addNodeToOpenList(adjNodes[i]);
        }
    }

    isInCloseList(node) {
        return !!this._closedList.find(closed => closed.equal(node));
    }

    isInOpenList(node) {
        return !!this._openList.find(closed => closed.equal(node));
    }

    isNotFound() {
        return this._openList.length === 0;
    }

}

Game_Map.prototype.graph = function () {
    return this._graph;
}

var _GameMapSetup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function () {
    _GameMapSetup.call(this);
    this._graph = new WeightedGraph();
}

Game_CharacterBase.prototype.startRouteExploration = function (goalX, goalY) {
    let start = $gameMap.graph().node(this.x, this.y);
    let goal = $gameMap.graph().node(goalX, goalY);
    this._route = new RouteExploration($gameMap.graph());
    this._route.start(start, goal);
}

Game_Character.prototype.findDirectionTo = function (goalX, goalY) {
    return this._route.findDirection(this.x, this.y);
}

Game_Temp.prototype.setDestination = function (x, y) {
    this._destinationX = x;
    this._destinationY = y;
    $gamePlayer.startRouteExploration(x, y);
};