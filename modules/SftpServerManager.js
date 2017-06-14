define(function(require, exports, module) {
	"use strict";
	
	var Strings							= brackets.getModule("strings"),
		 CommandManager				= brackets.getModule("command/CommandManager"),
		 Dialogs							= brackets.getModule("widgets/Dialogs"),
		 Mustache						= brackets.getModule("thirdparty/mustache/mustache"),
		
		 CS_MANAGER						= require("modules/ConnectionSettingManager"),
		 STRINGS							= require("modules/Strings"),
		 DRAG_AND_MOVE					= require("modules/DragAndMove"),
		
		 dialog_server_manager_tmp	= require("text!html/dialog_server_manager.html"),
		 $dialog_server_manager,
		 
		 context							= {Strings: Strings, MyStrings: STRINGS},
		 
		 _nodeDomain;
	
	
	/* getList ------------------------------------------------------------ */
	function getList(accessPoint) {
		
		var serverConnectionSetting = {};
		
		CS_MANAGER.getConnectionSetting(function(connectionSetting){
			
			if(accessPoint == "test"){
				serverConnectionSetting = {
					method: connectionSetting.method,
					host: connectionSetting.host,
					port: connectionSetting.port,
					username: connectionSetting.username,
					rsaPath: connectionSetting.rsaPath,
					password: connectionSetting.password,
					serverPath: connectionSetting.serverPath
				};
			}else if(accessPoint == "production"){
				serverConnectionSetting = {
					method: connectionSetting.method_p,
					host: connectionSetting.host_p,
					port: connectionSetting.port_p,
					username: connectionSetting.username_p,
					rsaPath: connectionSetting.rsaPath_p,
					password: connectionSetting.password_p,
					serverPath: connectionSetting.serverPath_p
				};
			}
			
			_nodeDomain.exec("getLs", serverConnectionSetting.serverPath, serverConnectionSetting).done(function(){
					
			}).fail(function (err) {
				console.error(err);
			});
			
			
		});
		
	}
	
	
	/* setUploadEvent ------------------------------------------------------------ */
	function setUploadEvent(){
		
		//<li class="jstree-closed"><ins class="jstree-icon"></ins><a href="#" class=""><div style="display:inline-block;width:10px;"></div><ins class="jstree-icon"> </ins><span>_css</span></a></li>
		//<li class="jstree-leaf"><ins class="jstree-icon"></ins><a href="#" class=""><div style="display:inline-block;width:10px;"></div><ins class="jstree-icon"> </ins><span>index</span><span class="extension">.html</span></a></li>
		
		$(_nodeDomain).on('getLs', function(obj, res){
			
			var list = "";
			
			//console.log(res);
			
			for (var i = 0; i < res.length; i++) {
				if(res[i]["type"] == 1){
					list += '<li class="jstree-closed jstree-folder" style="padding-left:10px"><ins class="jstree-icon"></ins><a href="#" class="" data-path="'+ res[i]["name"] + '/"><div style="display:inline-block;"></div><ins class="jstree-icon"> </ins><span>' + res[i]["name"] + '</span></a></li>';
				}else if(res[i]["type"] == 0){
					var fname = res[i]["name"].split(/\.(?=[^.]+$)/);
					list += '<li class="jstree-leaf"><ins class="jstree-icon"></ins><a href="#" class=""><div style="display:inline-block;"></div><ins class="jstree-icon"> </ins><span>' + fname[0] + '</span><span class="extension">' + fname[1] + '</span></a></li>';
				}
			}
			$dialog_server_manager.find(".modal-body ul").html(list);
			
			setFolder($dialog_server_manager);
			
			function setFolder($tgs){
				$tgs.find(".jstree-folder a, .jstree-folder ins").each(function(){
					$(this).on("click", function(){
						if ( $(this).parent().hasClass("jstree-closed") ){
							$(this).parent().removeClass("jstree-closed");
							$(this).parent().addClass("jstree-open");
							$(this).parent().append('<ul class="jstree-brackets jstree-no-dots jstree-no-icons" style="margin-left:10px;"><li class="jstree-closed jstree-folder" style="padding-left:10px"><ins class="jstree-icon"></ins><a href="#" class=""><div style="display:inline-block;"></div><ins class="jstree-icon"> </ins><span>_notes</span></a></li><li class="jstree-closed jstree-folder" style="padding-left:10px"><ins class="jstree-icon"></ins><a href="#" class=""><div style="display:inline-block;"></div><ins class="jstree-icon"> </ins><span>lib</span></a></li><li class="jstree-leaf"><ins class="jstree-icon"></ins><a href="#" class=""><div style="display:inline-block;"></div><ins class="jstree-icon"> </ins><span>common</span><span class="extension">.js</span></a></li><li class="jstree-leaf"><ins class="jstree-icon"></ins><a href="#" class=""><div style="display:inline-block;"></div><ins class="jstree-icon"> </ins><span data-reactid=".0.4.$_js.2.$index=1js.1.2">index</span><span class="extension" data-reactid=".0.4.$_js.2.$index=1js.1.3">.js</span></a></li></ul>');
							setFolder($(this).parent());
						}else{
							$(this).parent().removeClass("jstree-open");
							$(this).parent().addClass("jstree-closed");
							$(this).parent().find("ul").remove();
						}
					});
				});
			}
			
			
			
		});
		
	}
	
	
	/* openDialog ------------------------------------------------------------ */
	function openDialog(){
		
		
		var dl = Dialogs.showModalDialogUsingTemplate(Mustache.render(dialog_server_manager_tmp, context));
		$dialog_server_manager = dl.getElement();
		
		getList("test");
		
		
		
		DRAG_AND_MOVE.drag_and_move(document.querySelector("#au-ssftp-server_manager_dialog"), { dragZone: ".modal-wrapper .modal-header", resizer: true });
		
	}
	
	
	/* addMenu ------------------------------------------------------------ */
	function addMenu(menu, mid){
		
		CommandManager.register(STRINGS.TXT_REMOTE_SITE_VIEW, mid, openDialog);
		menu.addMenuItem(mid);
		
	}
	
	
	/* init ------------------------------------------------------------ */
	function init(nodeDomain){
		
		_nodeDomain = nodeDomain;
		
		setUploadEvent();
		
	}
	
	
	/* return ------------------------------------------------------------ */
	return {
		init: init,
		addMenu: addMenu
	};
	
});