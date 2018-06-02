	let userLoggedIn = 0;
		
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
		
		let userSession = {name: "", cpf: "", email: "", address: "", tel:"", profilePic: "", isAdmin: 0};
		
		//Função para carregar alguns usuários de demonstração 
		function loadUsers(){
		
			const userData = [
				{ cpf: "adm", name: "Bill", tel: "123", address: "Rua 1", email: "bill@mypet.com", password: "adm", profilePic:"http://meganandtimmy.com/wp-content/uploads/2012/09/4ce4a17fb7f35-447x600.jpg", isAdmin: 1 },
				{ cpf: "321", name: "Jubileu", tel: "321", address: "Rua 3", email: "jubileu@gmail.com", password: "321", profilePic:"https://pbs.twimg.com/media/C3BxfpmWIAAGJpw.jpg", isAdmin: 0 }
			];
		
			let request = indexedDB.open("users_db", 1);
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
					let userObjectStore = db.transaction("users", "readwrite").objectStore("users");
					for (let i in userData) {
						userObjectStore.add(userData[i]);
					}
				};
			};
		}
		loadUsers();	
		
		function startLogin() {
			let loginID = $("#user").val();
			let loginPass = $("#password").val();
			
			if(loginID == NULL || loginPass == NULL){
					alert("Preencha todos os campos!");
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
						alert("ERROU");
					}
					}
				else{
					alert("ERROU CPF");
				}
				};
			}
		}
		
		function createAccount(){
			
			
			
		}