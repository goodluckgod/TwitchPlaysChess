var xDiv = {
	"a": 0,
	"b": 1,
	"c": 2,
	"d": 3,
	"e": 4,
	"f": 5,
	"g": 6,
	"h": 7,
}

var votes = [];

var timeout = false

const client = new tmi.Client({
  connection: {
    secure: true,
    reconnect: true
  },
  channels: [ 'chname' ]
});

var newVote = function() {
	if (timeout === false) {
		timeout = true
		console.log("Timeout Started")
		CHESSAPP.ui.voteStarted()
		setTimeout(voteEnded, 5000);
	}
	CHESSAPP.ui.updateVotelist(votes)
}

var getCounts = function() {
	var maxCount = 0
	var currentItem = null
	votes.forEach(function(item, index){
		console.log(item.count)
	   	if (item.count > maxCount) {
			currentItem = {index: index, item: item}
	   	} else if (item.count == maxCount && Math.random() > 0.5) {
			currentItem = {index: index, item: item}
	   	}
	})
	return currentItem
}

var voteEnded = function() {
	console.log('Vote Ended')
	const item = getCounts()

	if (CHESSAPP.ui.promotionActive == false) {
		const moveOptions = item.item.moveOptions
  		CHESSAPP.GamePlay.movePieceTo(moveOptions);
	} else {
		
        var val = 1

		switch (item.index) {
			case 1:
				val = "knight"
			case 2:
				val = "bishop"
			case 3:
				val = "rook"
			case 4:
				val = "queen"
		} 

		console.log("User selected " + val);
		CHESSAPP.ui.promotion_data.pieceType = val;
		CHESSAPP.GamePlay.promote(CHESSAPP.ui.promotion_data);
	}

	timeout = false

	votes = []

	CHESSAPP.ui.updateVotelist(votes)
	
}

client.connect();

client.on('message', (channel, tags, message, self) => {
	console.log(CHESSAPP.ui.promotionActive)
	if (CHESSAPP.ui.promotionActive == false) {
		var pieces = message.split("/")
  		var currentPiece = pieces[0].split("")

        if (pieces[1] == undefined || pieces[0].length !== 2 || pieces[1].length !== 2) {
			return
		}

  		var movetoPiece = pieces[1].split("")
  		var selectedPieceIndex = getPiece(currentPiece[0], Number(currentPiece[1]))
  		var cellTemp = CHESSAPP.GamePlay.cells[xDiv[movetoPiece[0]]];
  		if (cellTemp == undefined) return;

  		var cell = cellTemp[Math.abs(Number(movetoPiece[1]) - 8)] 

     

  		if (cell !== undefined && selectedPieceIndex !== undefined && selectedPieceIndex != -1){
  			var opt = CHESSAPP.GamePlay.isOption(selectedPieceIndex, cell);
  			if(opt) {
				var index = xDiv[currentPiece[0]] + Math.abs(Number(currentPiece[1]) - 8) +  xDiv[movetoPiece[0]] + Math.abs(Number(movetoPiece[1]) - 8)
				var moveOptions = {
  					piece: selectedPieceIndex,
  					x: xDiv[movetoPiece[0]],
  					y: Math.abs(Number(movetoPiece[1]) - 8),
  					local: true,
  					special: opt.special
  				}

				if (votes[index] == undefined) {
			
					votes[index] = {count: 1, moveOptions: moveOptions, message: message}
				} else {
					votes[index].count += 1
				}	
				


				newVote()
  			}       
  		}
	} else {

        console.log(message);

		if (message !== "knight" && message !== "bishop" && message !== "rook" && message !== "queen") {
			return;
		}

        var index = 1

		switch (message) {
			case "bishop":
				index = 2
			case "rook":
				index = 3
			case "queen":
				index = 4
		} 


		

		val = message
		if(val){
		  	if (votes[index] == undefined) {
				votes[index] = {count: 1, message: message}
			} else {
				votes[index].count += 1
			}		
			newVote()
		}
	}  

});

function getPiece(x, y) {
	console.log("before", x, y);
    var x = xDiv[x]
	var y = Math.abs(y - 8)
    console.log("after", x, y);
	var retval = undefined
	CHESSAPP.GamePlay.pieces.forEach(function(item, index) {
       if (item !== null && item.x == x && item.y == y && item.justMoved == false) {
		   retval = item
		   return
	   }
	});
	return retval
	
}