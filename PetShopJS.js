	
		function changePageMyProfile(userSession) {
			if(userLoggedIn == 1){
				$("#content").load("myprofile.html", function() {
					$("#userName").text(userSession.name);
					$("#userCPF").text(userSession.cpf);
					$("#userAddress").text(userSession.address);
					$("#userEmail").text(userSession.email);
					$("#userTel").text(userSession.tel);
					$("#userPic").attr('src', userSession.profilePic);
				});
			}
			else{
				$("#content").load("login.html", function() {
				});				
			}
		}
		
		function changePageRegister() {
			$("#content").load("register.html", function() {
            });
		}
		
		function changePageMyCart() {
            $("#content").load("cart.html", function() {
            });
        }
		
		function changePageAbout() {
            $("#content").load("about.html", function() {
            });
        }

		function changePageProducts() {
            $("#content").load("products.html", function() {
            });
        }
		
		function changePageServices() {
            $("#content").load("services.html", function() {
            });
        }
		
		function changePageServiceView() {
			$("#content").load("service_view.html", function() {
			});
		}
		
		function changePageServiceSchedule() {
			$("#content").load("service_schedule.html", function() {
			});
		}
		
		function changePageMyProfileEdit() {
			$(".main").load("myprofileedit.html", function() {
			});
		}
	
		function changePageMyPet() {
			$(".main").load("mypet.html", function() {
			});
		}
		
		function changeOrderConfirm() {
			$("#content").load("order_data.html")
		}
		
		//Inicio da organização do IndexedDB
		let db;
		
		//Inicialmente não há um usuário logado
		let userLoggedIn = 0;
		
		//Dados do usuário que estiver em uma sessão estarão aqui
		let userSession = {name: "", cpf: "", email: "", address: "", tel:"", profilePic: "", isAdmin: 0};
		
		//Função para carregar alguns usuários de demonstração 
		function loadData(){
		
			const userData = [
				{ cpf: "admin", name: "Bill", tel: "123", address: "Rua 1", email: "bill@mypet.com", password: "admin", profilePic:"http://meganandtimmy.com/wp-content/uploads/2012/09/4ce4a17fb7f35-447x600.jpg", isAdmin: 1 },
				{ cpf: "321", name: "Jubileu", tel: "321", address: "Rua 3", email: "jubileu@gmail.com", password: "321", profilePic:"https://pbs.twimg.com/media/C3BxfpmWIAAGJpw.jpg", isAdmin: 0 }
			];
		
			let request = indexedDB.open("HappyPet_db", 1);
			request.onupgradeneeded = function(event) {
				db = event.target.result;

				let objectStore = db.createObjectStore("users", { keyPath: "cpf" });

				objectStore.createIndex("name", "name", { unique: false });

				objectStore.createIndex("email", "email", { unique: true });
			
				objectStore.createIndex("tel", "tel", { unique: false });
			
				objectStore.createIndex("address", "address", { unique: false });
			
				objectStore.createIndex("password", "password", { unique: false });
			
				objectStore.createIndex("isAdmin", "isAdmin", { unique: false });
			
				objectStore.createIndex("profilePic", "profilePic", { unique: false });

				objectStore.transaction.oncomplete = function(event) {
					// Store values in the newly created objectStore.
					objectStore = db.transaction("users", "readwrite").objectStore("users");
					for (let i in userData) {
						objectStore.add(userData[i]);
					}
				};
			};
		}
		loadData();	
		
		function startLogin() {
			let loginID = $("#user").val();
			let loginPass = $("#password").val();
			
			if($("#user").val() == "" || loginPass == ""){
					alert("Preencha todos os campos!");
					return;
			}
			else{
				let objectStore = db.transaction(["users"]).objectStore("users");
				let request = objectStore.openCursor(loginID);
				request.onsuccess =  event => {
				
					let cursor = event.target.result;
					if(cursor){
						if(loginPass == cursor.value.password){
							userLoggedIn = 1;
							userSession.name = cursor.value.name;
							userSession.cpf = cursor.value.cpf;
							userSession.email = cursor.value.email;
							userSession.address = cursor.value.address;
							userSession.tel = cursor.value.tel;
							userSession.profilePic = cursor.value.profilePic;
							userSession.isAdmin = cursor.value.isAdmin;
							changePageMyProfile(userSession);
					}
						else{
							alert("Senha incorreta");
						}
					}
					else{
						alert("Não existe um usuário com esse CPF");
					}
				};
			}
		}
		
		function startLogoff(){
			userSession = {name: "", cpf: "", email: "", address: "", tel:"", profilePic: "", isAdmin: 0};
			userLoggedIn = 0;
			changePageMyProfile();
		}
		
		function createAccount(){
			
			if($("#registerCPF").val().split(" ").join("") == "" || $("#registerName").val().split(" ").join("") == "" || $("#registerTel").val().split(" ").join("") == "" || $("#registerAddress").val().split(" ").join("") == "" || $("#registerEmail").val().split(" ").join("") == "" || $("#registerPassword").val().split(" ").join("") == "" || $("#registerConfirmPassword").val().split(" ").join("") == ""){
					alert("Preencha todos os campos!");
					return;
			}
			else{
				let newUser = { cpf: $.trim($("#registerCPF").val()), name: $.trim($("#registerName").val()), tel: $.trim($("#registerTel").val()), address: $.trim($("#registerAddress").val()), email: $.trim($("#registerEmail").val()), password: $("#registerPassword").val(), profilePic: $("#registerProfilePic").val(), isAdmin: 0 };
			
				if($("#registerConfirmPassword").val() == newUser.password){
					let objectStore = db.transaction(["users"], "readwrite").objectStore("users");
					objectStore.add(newUser);
					
					userLoggedIn = 1;
					userSession.name = newUser.name;
					userSession.cpf = newUser.cpf;
					userSession.email = newUser.email;
					userSession.address = newUser.address;
					userSession.tel = newUser.tel;
					userSession.profilePic = newUser.profilePic;
					console.log(userSession.profilePic);					
					userSession.isAdmin = newUser.isAdmin;
					
					changePageMyProfile(userSession);
				}
				else{
					alert("Erro na confirmação de senha!");
				}
			}
		}
		
		function editAccount(){

			let objectStore = db.transaction(["users"], "readwrite").objectStore("users");
			let request = objectStore.openCursor(userSession.cpf);
			request.onsuccess =  event => {
				
				let cursor = event.target.result;
				if($("#editEmail").val().split(" ").join("") != ""){
					let requestEmail = objectStore.openCursor($("#editEmail").val());
					request.onsuccess =  event => {
						alert("Já existe um usuário cadastrado com esse email");
						return;
					}
					cursor.value.email = $("#editEmail").val();
					userSession.email = cursor.value.email;
				}
				if($("#editTel").val().split(" ").join("") != ""){
					cursor.value.tel = $("#editTel").val();
					userSession.tel = cursor.value.tel;
				}
				if($("#editPassword").val().split(" ").join("") != ""){
					if($("#editPassword").val() == $("#editConfirmPassword").val()){
						cursor.value.password = $("#editPassword").val();
					}
					else{
						alert("Erro na confirmação de senha!");
						return;
					}
				}
				let requestUpdate = objectStore.put(cursor.value);
				changePageMyProfile(userSession);
			}
		}