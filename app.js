
	Hoist.apiKey("UYSYDAPGTLGXMCFIDZQU");

	
	var els = {							//Elements on the page
			rankings: $("#rankings-list"),
			newPlayer: $(".newplayer")
		},
		collection = Hoist("legends"), 	//Each player is a legend
		ranks = Hoist("ranks"), 		//All of the ranks are stored against one item
		rankings = {}, 					//The returned object from the ranks collection
		topDog = "";					//Current top leader. Used to compare to send notifications
	


	//Sort the returned list based on the ranking.ranks
	var sortListByRanking = function(list) {
		return list.sort(function(a, b) {
			return rankings.ranks[a.x_id] - rankings.ranks[b.x_id];
		});
	}



	var drawList = function() {
	
		collection.get(function(list) {

			sortListByRanking(list);

			els.rankings.empty();
			for(var i = 0; i < list.length; i++) {
				els.rankings.append("<li data-id='" + list[i].x_id + "'>" + (i == 0 ? "<span class='badge'></span>" : "") + list[i].name + "</li>");
			}

		});

	};


	function run() {
		//The ranks ID is hard coded because of my data issues
		ranks.get("1c23e5ee-263e-452e-aaab-05a9dededfb0", function(r) {
			rankings = r;
			for(var key in rankings.ranks) {
				if(rankings.ranks[key]==0) {
					topDog = key;
				}
			}
			drawList();
		});
	};
		
	

	if(getParameterByName("screen")) {

		//Don't attach the events for drag and drop because it's currently
		//being viewed on a large screen
		$("body").addClass("screen-mode");
		run();
		//refresh the list automatically
		setInterval(run, 10000);

	} else {


		els.newPlayer.on("click", function() {
			var name = prompt("Enter a name");
			var email = prompt("Enter an email address");
			
			collection.post({name: name, emailAddress: email}, function(player) {
				rankings.ranks[player.x_id] = size(rankings.ranks);
				ranks.post(rankings, function(r) {
					rankings = r;
					drawList();
				})
			});
		
		});

		els.rankings.sortable({
			start: function() {
				$(".badge").remove();
			},	
			stop: function(event, ui) {
				rankings.ranks = [];
				//Send a notification if the first item has changed
				if(topDog != $("li:first-child", els.rankings).data("id")) {
					Hoist.notify("CONGRATULATIONS", {Name: $("li:first-child", els.rankings).text()}, function() { console.log("Sent"); });
					topDog = $("li:first-child", els.rankings).data("id");
				} 
				//Update the ranks hash in the rankings object
				var obj = {};
				$.each($("li", els.rankings), function(i, el) {
					obj[$(el).data("id")] = i;
				});
				rankings.ranks = obj;
				ranks.post(rankings, function(res) {
					rankings = res;
					drawList();
				});
			}
		});
		run();

	}