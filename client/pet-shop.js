//Inicio da organização do IndexedDB
let db;

//Inicialmente não há um usuário logado
let userLoggedIn = false;

//Dados do usuário que estiver em uma sessão estarão aqui
let userSession = {name: "", cpf: "", email: "", address: "", tel:"", profilePic: "", isAdmin: false, password:""};

//abertura do banco de dados
let request = indexedDB.open("HappyPet_db", 1);

// leitura do banco (caso já exista)
request.onsuccess = function(event) {
    db = event.target.result;
}

$.delete = function(url, data, callback){
 
  return $.ajax({
    url: url,
    type: 'DELETE',
    success: callback,
    data: data,
  });
}

$.put = function(url, data, callback){
 
  return $.ajax({
    url: url,
    type: 'PUT',
    success: callback,
    data: data,
  });
}

// criação do banco (caso necessário)
request.onupgradeneeded = function(event) {
    
    db = event.target.result;

    //criação da "tabela" de usuários
    let userStore = db.createObjectStore("users", { keyPath: "cpf" });
    addUsers(userStore);
    
    //criação da "tabela" de pets
    let petStore = db.createObjectStore("pets", { autoIncrement: true });
    petStore.createIndex("owner", "owner", { unique: false });
    addPets(petStore);
	
    //criação da "tabela" de produtos
    let productsStore = db.createObjectStore("products", { autoIncrement: true });
    productsStore.createIndex("animal", "animal", {unique: false});
    productsStore.createIndex("animal-category", ["animal", "category"], {unique: false});
    addProducts(productsStore);
    
    // criação da "tabela" do carrinho
    let cartStore = db.createObjectStore("cart", { keyPath: "key" });
    
    // criação da "tabela" dos pedidos
    let orderStore = db.createObjectStore("orders", { autoIncrement: true });
    orderStore.createIndex("user", "user", { unique: false });
};

//function to change hash
function changeHash(newHash){
    location.hash = newHash;
}

//change hash listener
$(function(){

    $(window).on('hashchange', function(){
        
      // check if it is a product category
      if (location.hash.startsWith("#products")) {
          loadPageProducts(location.hash);
          return;
      }
      if (location.hash.startsWith("#product-view")) {
          loadPageProductView(location.hash.split('-')[2]);
          return;
      }
      if (location.hash.startsWith("#order-detail")) {
          showOrderDetails(location.hash.split('-')[2]);
          return;
      }
      if (location.hash.startsWith("#pet-edit")) {
          loadPageEditPet(location.hash.split('-')[2]);
          return;
      }
	  if (location.hash.startsWith("#product-edit")) {
          modifyProduct(location.hash.split('-')[2]);
          return;
      }
      if (location.hash.startsWith("#services")) {
          $("#content").load("services.html");
          return;
      }

      let content = $("#content");

      switch(location.hash){
        case "":
          content.load("home.html");
          break;
          
        case "#cartao":
        case "#boleto":
          break;

        case "#about":
          content.load("about.html");
          break;
		  
        case "#add-pet":
          $("#my-area-content").load("new-pet.html");
          break;
    
        case"#addProduct":
    			content.load("new-product.html");
          break;

        case "#adm-admins":
          $("#adm-content").load("adm/admins.html").ready(function(){
    				showAdmins();
    		  });
          break;

        case "#adm-alter-client":
          $("#adm-content").load("adm/alter-client.html");
          break;

        case "#adm-alter-product":
          $("#adm-content").load("adm/alter-product.html");
          break;

        case "#adm-alter-service":
          $("#adm-content").load("adm/alter-service.html");
          break;

        case "#adm-alter-session":
          $("#adm-content").load("adm/alter-session.html");
          break;

        case "#adm-area":
          content.load("adm/adm-area.html");
          break;

        case "#adm-clients":
    			showCustomers();
          break;

        case "#adm-orders":
    			loadPageAdmOrders();
          break;

        case "#adm-new-product":
          $("#adm-content").load("adm/new-product.html");
          break;

        case "#adm-new-service":
          $("#adm-content").load("adm/new-service.html");
          break;

        case "#adm-schedule-session":
          $("#adm-content").load("adm/schedule-session.html");
          break;

        case "#adm-services":
          $("#adm-content").load("adm/services.html");
          break;

        case "#adm-sessions":
          $("#adm-content").load("adm/sessions.html");
          break;

        case "#adm-stock":
    			showStock();
          break;

        case "#login":
          loadPageLogin();
          break;

        case "#my-cart":
          loadPageCart();
          break;

        case "#my-area":
          loadPageMyArea();
          break;
          
        case "#my-profile":
          loadPageMyProfile();
          break;
          
        case "#my-pets":
          loadPageMyPet();
          break;

        case "#my-orders":
          loadPageMyOrders();
          break;
          
    		case "#my-profile-edit":
          loadPageEditProfile();
          break;

        case "#my-sessions":
          loadPageMySessions();
          break;

        case "#order-confirmation":
          loadPageConfirmation();
          break;

        case "#register":
          content.load("register.html");
          break;

        case "#register-admin":
          $("#adm-content").load("register-admin.html");
          break;

        case "#schedule-session":
          loadPageSchedule();
          break;

        case "#scheduling-confirmation":
          content.load("scheduling-confirmation.html");
          break;

        case "#service-view":
          content.load("service-view.html");
          break;

        default:
          content.load("not-found.html");
          break;
      }
    });

    $(window).trigger('hashchange');

});

function loadPageLogin() {
    $("#content").load("login.html", function() {
        $("#user").keydown(function(event){
            if (event.which == 13 || event.keyCode == 13)
                startLogin();
        });
        $("#password").keydown(function(event){
            if (event.which == 13 || event.keyCode == 13)
                startLogin();
        });
    });
}

function loadPageSchedule() {
    // verifica se está logado
    if (!userLoggedIn) {
        alert("Por favor, faça login para continuar.");
        changeHash('login');
    } 
    // verifica se não é um adm
    else if (userSession.isAdmin) {
        alert("Favor logar numa conta de cliente para agendar sessões.");
    }
    else {
        $("#content").load("schedule-session.html");
    }
}

function loadPageConfirmation() {
    // verifica se está logado
    if (!userLoggedIn) {
        alert("Por favor, faça login para continuar.");
        changeHash('login');
    } 
    // verifica se não é um adm
    else if (userSession.isAdmin) {
        alert("Favor logar numa conta de cliente para realizar compras.");
    }
    else {
        $("#content").load("order-confirmation.html", function() {
            $("#nome").text("Nome: " + userSession.name);
            $("#email").text("E-mail: " + userSession.email);
            $("#telefone").text("Telefone: " + userSession.tel);
            $("#cpf").text("CPF: " + userSession.cpf);
            $("#endereco").text(userSession.address);
            // sum the item values
            let total = 0;
            
            let objectStore = db.transaction("cart", "readonly").objectStore("cart");
            objectStore.openCursor().onsuccess = function(event) {
                let cursor = event.target.result;
                if (cursor) {
                    total += (parseFloat(cursor.value.price) * parseInt(cursor.value.quantity));
                    cursor.continue();
                } 
                else {
                    $("#total1").text('R$ ' + total.toFixed(2));
                    $("#total2").text('R$ ' + (total+10).toFixed(2));
                }
            }
        });
    }
}

function changePersonalData() {
    $("#content").load("my-area.html", function() {
        changeHash("my-profile-edit");
    });
}

function changeDeliverAdress() {
    alert("Funcionalidade não implementada");
}

function search(){
    alert("A função de BUSCA será implementada com auxílio do servidor na próxima parte do projeto.");
}

function finishOrder() {
    // cria o objeto com dados do pedido
    let order = {
        user: userSession.cpf,
        name: userSession.name,
        address: userSession.address,
        tel: userSession.tel,
        date: new Date(),
        itemTotal: $("#total1").text(),
        shipTotal: "R$ 10.00",
        orderTotal: $("#total2").text(),
        products: []
    };
    
    // carrega os itens do carrinho
    db.transaction("cart", "readwrite").objectStore("cart").openCursor().onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            
            // adiciona os produtos no pedido
            order.products.push(cursor.value);
            
            // remove os produtos comprados do estoque
            db.transaction("products", "readwrite").objectStore("products").openCursor(cursor.value.key).onsuccess = function(event) {
                let cursor2 = event.target.result;
                if (cursor2) {
                    let prod = cursor2.value;
                    prod.quantity -= cursor.value.quantity;
                    cursor2.update(prod);
                }
            };
            cursor.delete();
            cursor.continue();
        }
        else {
            // após remover todos itens do carrinho, salvar o pedido no banco
            let orderTransaction = db.transaction("orders", "readwrite").objectStore("orders").add(order);
            orderTransaction.onsuccess = function(event) {
                alert("Pedido realizado com sucesso!");
                changeHash("my-cart");
            };
            orderTransaction.onerror = function(event) {
                alert("Não foi possível registrar o pedido.");
            }
        }
    };
}

function loadPageCart() {
    $("#content").load("my-cart.html", function() {
        // open the table
        let objectStore = db.transaction("cart", "readonly").objectStore("cart");
        
        // check if there are any items
        let countRequest = objectStore.count();
        countRequest.onsuccess = function() {
            if(countRequest.result == 0) {
                $("#emptyCart").show();
                $("section").hide();
            } else {
                // get the model item
                let model = $("#item").clone();
                $("#item").remove();
                
                // sum the item values
                let total = 0;
                
                objectStore.openCursor().onsuccess = function(event) {
                    let cursor = event.target.result;
                    if (cursor) {
                        let newItem = model.clone();
                        newItem.find("#itemImage img").attr('src', cursor.value.picture);
                        newItem.find("#itemImage").attr('href', "javascript:changeHash('product-view-" + cursor.value.key + "')");
                        newItem.find("#itemName").text(cursor.value.name);
                        newItem.find("#itemName").attr('href', "javascript:changeHash('product-view-" + cursor.value.key + "')");
                        newItem.find("#itemPrice").text("R$ " + cursor.value.price);
                        newItem.find("#itemQuantity").val(cursor.value.quantity);
                        newItem.find("#itemQuantity").attr('id', 'itemQuantity-' + cursor.value.key);
                        newItem.find("#itemUpdate").attr('onclick', "updateItemQuantity('" + cursor.value.key + "')");
                        newItem.find("#itemRemove").attr('onclick', "removeItem('" + cursor.value.key + "')");
                        $("#itemList").append(newItem);
                        
                        total += (parseFloat(cursor.value.price) * parseInt(cursor.value.quantity));
                        cursor.continue();
                    } 
                    else {
                        $("#total1").text('R$ ' + total.toFixed(2));
                        $("#total2").text('R$ ' + (total+10).toFixed(2));
                    }
                }
            }
        }
    });
}

function removeItem(productKey) {
    let objectStore = db.transaction("cart", "readwrite").objectStore("cart");
    let request = objectStore.delete(parseInt(productKey));
    request.onerror = function(event) {
        alert("Erro ao remover produto");
    };
    request.onsuccess = function(event) {
        loadPageCart();
    }
}

function updateItemQuantity(productKey) {
    let quantity = parseInt($('#itemQuantity-' + productKey).val());
    if (quantity < 0) {
        alert("A quantidade não pode ser menor que zero!");
    } 
    else if (quantity == 0) {
        removeItem(productKey);
    }
    else {
        let objectStore = db.transaction("cart", "readwrite").objectStore("cart");
        objectStore.openCursor(parseInt(productKey)).onsuccess = function(event) {
            let cursor = event.target.result;
            if (cursor) {
                let item = cursor.value;
                item.quantity = parseInt($('#itemQuantity-' + productKey).val());
                
                let request = cursor.update(item);
                request.onerror = function(event) {
                    alert("Erro ao atualizar produto");
                };
                request.onsuccess = function(event) {
                    loadPageCart();
                }
            } else {
                alert("Erro ao atualizar produto");
            }
        }
    }
}

function addCart(productKey) {
    // abre a tabela para escrita
    let objectStore = db.transaction("cart", "readwrite").objectStore("cart");
    objectStore.openCursor(parseInt(productKey)).onsuccess = function(event) {
        let cursor = event.target.result;
        // se encontrar, significa que o produto já estava no carrinho
        if (cursor) {
            let item = cursor.value;
            item.quantity++;
            
            let request = cursor.update(item);
            request.onerror = function(event) {
                alert("Erro ao adicionar produto");
            };
            request.onsuccess = function(event) {
                changeHash("my-cart");
            }
        }
        else {
            // precisa encontrar os dados do produto
            let productStore = db.transaction("products", "readonly").objectStore("products");
            productStore.get(parseInt(productKey)).onsuccess = function(event) {
                let product = event.target.result;
                let newItem = {
                    key: parseInt(productKey),
                    picture: product.picture,
                    name: product.name,
                    price: product.price,
                    quantity: 1
                };
                let request = db.transaction("cart", "readwrite").objectStore("cart").add(newItem);
                request.onerror = function(event) {
                    alert("Erro ao adicionar produto");
                };
                request.onsuccess = function(event) {
                    changeHash("my-cart");
                }
            }
        }
    }
}

function loadPageProductView (productKey) {
    // load the product details first
    $.get('/product/', {id: productKey}, function(result){
        // load the page html
        $("#content").load("product-view.html", function() {
            if (result) {
                $("#productImage").attr('src', result.picture);
                $("#productName strong").text(result.name);
                $("#productPrice").text("R$ " + result.price);
                $("#productDesc").text(result.description);
                $("#productCart").attr('onclick', "addCart('" + productKey + "')");
            }
            else {
                $("#productName strong").text("Produto não encontrado");
                $("#productPrice").text("R$ ??");
            }
        })
    });
}

// capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function loadPageProducts(hash) {
    // get the animal and category information
    let data = hash.split("-");

    // load the products html
    $("#content").load("products.html", function() {
        
        //create a product model to copy later
        let model = $(".product-cell").clone();
        $(".product-cell").remove();
        
		      
        // show all products
		let query = {};
        if (data.length == 1) {
            $("#title").text("Todos os produtos");
			query = {};		
        }
        // show products for only one animal
        else if (data.length == 2) {
            $("#title").text("Produtos para " + data[1] + "s");
			query = {animal: capitalizeFirstLetter(data[1])};
        }
        // show products for only one animal and one category
        else {
            $("#title").text(capitalizeFirstLetter(data[2]) + " para " + data[1] + "s");
			query = {animal: capitalizeFirstLetter(data[1]), category: capitalizeFirstLetter(data[2])};
        }
		
		$.get('/products/', {product: query}, function(result){
			let i;
			for(i = 0; i < result.length; i++){
				let product = result[i];
				let newElement = model.clone();
				newElement.find("#productImage").attr('src', product.picture);
				newElement.find("#productTitle").text(product.name);
				newElement.find("#productPrice").text("R$ " + parseFloat(product.price).toFixed(2));
				newElement.find("a").attr('href', "javascript:changeHash('product-view-" + product._id + "')");
				$("#products-section > .row").append(newElement);	
			}
        });
	});
}

function loginClick() {
    if (userLoggedIn) {
        if (userSession.isAdmin)
            changeHash('adm-area');
        else
            changeHash('my-area');
    } 
    else {
        changeHash('login');
    }
}

function loadPageMyArea() {
    if(userLoggedIn){
        $("#content").load("my-area.html", function() {
            loadPageMyProfile();
        });
    }
    else{
        changeHash('login');
    }
}

function loadPageMyProfile() {
		
    $("#my-area-content").load("my-profile.html", function() {
        $("#userName").text(userSession.name);
        $("#userCPF").text(userSession.cpf);
        $("#userAddress").text(userSession.address);
        $("#userEmail").text(userSession.email);
        $("#userTel").text(userSession.tel);
        $("#userPic").attr('src', userSession.profilePic);
    });

}

function loadPageMyPet() {
    $("#my-area-content").load("my-pet.html", function() {
        let model = $("#indiv-pet").clone();
        $("#indiv-pet").remove();
				
	$.get('/pets/', {id: userSession.cpf}, function(result){
			let i;	
			for(i = 0; i < result.length; i++){
				
				let pet = result[i];
                let newElement = model.clone();
				
                newElement.find("#petPic").attr('src', pet.petPic);
                newElement.find("#petName").text(pet.name);
                newElement.find("#petSpecies").text(pet.species);
                newElement.find("#petAge").text(pet.age);
                newElement.find("#petGender").text(pet.gender);
                newElement.find("#petBreed").text(pet.breed);
                newElement.find("#petEdit").attr('onClick', "changeHash('pet-edit-" + pet._id + "')");
                newElement.find("#petRemove").attr('onClick', "removePet('" + pet._id + "')");
                $("#petList").append(newElement);
                
            }
        });
    });
}
function loadPageEditPet (petKey) {
    $("#my-area-content").load("pet-edit.html", function() {
        $.get('/pet', {id: petKey}, function(result){
            let pet = result;
            $("#name").val(pet.name);
            $("#age").val(pet.age);
            $("#species").val(pet.species);
            $("#gender").val(pet.gender);
            $("#breed").val(pet.breed);
            $("#save").attr('onClick', "savePet('" + petKey + "')");
        });
    });
}

function removePet(petKey) {
	if (confirm("Você tem certeza que quer remover este pet?")) {
			$.delete('/remove-pet', {id: petKey}, function(result){
				loadPageMyPet();
		});	
  }
  else return;
}

function savePet(petKey) {
	console.log(petKey);
	if(petKey == '0'){
		let newPet = {	name: $("#name").val(),
						age: $("#age").val(),
						owner: userSession.cpf,
						species: $("#species").val(),
						gender: $("#gender").val(),
						breed: $("#breed").val(),
					  };
		$.post('/new-pet', {pet: JSON.stringify(newPet)}, function(result){
            if (result.success)
              changeHash("my-pets");
            else
              alert("Erro ao inserir pet");
		});
	}       
  else
  {
		let editPet = {	name: $("#name").val(),
                    age: $("#age").val(),
                    owner: userSession.cpf,
                    species: $("#species").val(),
                    gender: $("#gender").val(),
                    breed: $("#breed").val(),
                  };
		$.put('/edit-pet', {pet: JSON.stringify(editPet), petId: petKey}, function(result){
            if (result.success)
              changeHash("my-pets");
            else
              alert("Erro ao alterar pet");
    });
  }

}


function loadPageMyOrders() {
    
    // carrega o html
    $("#my-area-content").load("my-orders.html", function() {
        
        // carrega o modelo de pedido
        let model = $("#indiv-order").clone();
        $("#indiv-order").remove();
        
        // carrega o modelo do item
        let itemModel = model.find("#item").clone();
        model.find("#item").remove();
        
        // abre a tabela de pedidos
        let objectStore = db.transaction("orders", "readonly").objectStore("orders").index("user");
        objectStore.openCursor(userSession.cpf, 'prev').onsuccess = function(event) {
            let cursor = event.target.result;
            if (cursor) {
                // cria o elemento do pedido
                let newElement = model.clone();        
                newElement.find("#orderNumber").text("Pedido Nº: " + cursor.primaryKey);
                newElement.find("#orderDate").text("Realizado em: " + cursor.value.date.getDate() + '/' + (cursor.value.date.getMonth()+1) + '/' + cursor.value.date.getFullYear() + " às " + cursor.value.date.getHours() + ':' + cursor.value.date.getMinutes());
                newElement.find("#buyerName").text(cursor.value.name);
                newElement.find("#address").text("Endereço: " + cursor.value.address);
                newElement.find("#tel").text("Telefone: " + cursor.value.tel);
                newElement.find("#itemTotal").text(cursor.value.itemTotal);
                newElement.find("#shipTotal").text(cursor.value.shipTotal);
                newElement.find("#orderTotal").text(cursor.value.orderTotal);
                
                // adiciona os produtos
                cursor.value.products.forEach(function(product){
                    let newItem = itemModel.clone();
                    newItem.find("#productPic img").attr('src', product.picture);
                    newItem.find("#productPic").attr('href', "javascript:changeHash('product-view-" + product.key + "')");
                    newItem.find("#productName").text(product.name);
                    newItem.find("#productName").attr('href', "javascript:changeHash('product-view-" + product.key + "')");
                    newItem.find("#productPrice").text("R$ " + product.price);
                    newItem.find("#productQtd").text(product.quantity);
                    newItem.find("#productSubtotal").text("R$ " + (product.price*product.quantity));
                    newElement.find("#item-list").append(newItem);
                });
                
                // adiciona o pedido na lista
                $("#order-list").append(newElement);
                
                cursor.continue();
            }
        }
    });
}

function loadPageMySessions() {
    
    // carrega o html
    $("#my-area-content").load("my-sessions.html", function() {
        
    });
}

function startLogin() {
    let loginID = $("#user").val();
    let loginPass = $("#password").val();
	
	let loginInfo = { 	cpf: $("#user").val(),
						password: $("#password").val()
					};
    
    if($("#user").val() == "" || loginPass == ""){
        alert("Preencha todos os campos!");
        return;
    }
    else{
		
		$.get('/login', {user: loginInfo}, function(result){
			if (result == ''){
				alert("CPF e/ou senha errada!");
				return;
			}
			else{
				
				// set user as logged in
				userLoggedIn = true;
                    
				// get the user data
				userSession.name = result.name;
				userSession.cpf = result.cpf;
				userSession.email = result.email;
				userSession.address = result.address;
				userSession.tel = result.tel;
				userSession.profilePic = result.profilePic;
				userSession.isAdmin = result.isAdmin;
				userSession.password = result.password;
                    
				// update the header according to the user type
				if (userSession.isAdmin) {
					$("#loginButton").text("Área do Administrador");
					$("#cartButton").hide();
					changeHash('adm-area');
				} else {
					$("#loginButton").text("Minha Área");
					changeHash('my-area');
					return;
				}
			}
		});
    }
}


function startLogoff(){
    // reset buttons
    $("#loginButton").text("Login");
    $("#cartButton").show();
    
    // finish session variables
    userSession = {name: "", cpf: "", email: "", address: "", tel:"", profilePic: "", isAdmin: false, password:""};
    userLoggedIn = false;
    
    // open login screen
    loginClick();
}

function saveAccount(){
    
    if($("#registerCPF").val().split(" ").join("") == "" || $("#registerName").val().split(" ").join("") == "" || $("#registerTel").val().split(" ").join("") == "" || $("#registerAddress").val().split(" ").join("") == "" || $("#registerEmail").val().split(" ").join("") == "" || $("#registerPassword").val().split(" ").join("") == "" || $("#registerConfirmPassword").val().split(" ").join("") == ""){
            alert("Preencha todos os campos!");
    }
    else{
        
        let newUser = { cpf: $.trim($("#registerCPF").val()), name: $.trim($("#registerName").val()), tel: $.trim($("#registerTel").val()), address: $.trim($("#registerAddress").val()), email: $.trim($("#registerEmail").val()), password: $("#registerPassword").val(), profilePic: $("#registerProfilePic").val(), isAdmin: false };
        if (userLoggedIn) {
            userSession.name = newUser.name;
            userSession.email = newUser.email;
            userSession.address = newUser.address;
            userSession.tel = newUser.tel;
            newUser.profilePic = userSession.profilePic;
        } else {
            newUser.profilePic = "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909__340.png";
			if($("#registerConfirmPassword").val() == newUser.password){
				$.post('/new-user', {user: JSON.stringify(newUser)}, function(result){
					if (result.success)
						changeHash('login');
					else
						alert("Erro ao inserir usuário");
				});
			}        
			else{
				alert("Erro na confirmação de senha!");
			}		
		}
    }
}

function loadPageEditProfile() {
    $("#my-area-content").load("my-profile-edit.html", function() {
		
        $("#registerName").val(userSession.name);
        $("#registerCPF").val(userSession.cpf);
        $("#registerEmail").val(userSession.email);
        $("#registerTel").val(userSession.tel);
        $("#registerAddress").val(userSession.address);
		$("#registerPassword").val(userSession.password);
		$("#save").attr('onClick', "editAccount()");
    });
}

function editAccount(){

	if($("#registerPassword").val() != $("#registerConfirmPassword").val()){
		alert("Erro na confirmação de senha!");
		return;
	}
	else{
		let editUser = {	name: $("#registerName").val(),
							email: $("#registerEmail").val(),
							tel: $("#registerTel").val(),
							address: $("#registerAddress").val(),
							password: $("#registerPassword").val()
						};

		$.put('/edit-profile', {user: JSON.stringify(editUser), userId: userSession.cpf}, function(result){
			if (result.success){
				userSession.name = editUser.name;
				userSession.email = editUser.email;
				userSession.tel = editUser.tel;
				userSession.address = editUser.address;
				userSession.password = editUser.password;
				changeHash("my-area");
			}
			else
				alert("Erro ao alterar conta");
		});						
	}


}

function showOrderDetails(order) {
    // carrega o html
    $("#adm-content").load("my-orders.html", function() {
        
        // muda o titulo da pagina
        $("#title").text("Detalhes do pedido");
        
        // carrega o modelo de pedido
        let model = $("#indiv-order").clone();
        $("#indiv-order").remove();
        
        // carrega o modelo do item
        let itemModel = model.find("#item").clone();
        model.find("#item").remove();
        
        $.get('/order/', function(result){
            let i;
			for(i = 0; i < result.length; i++){
				
				let order = result[i];
                // cria o elemento do pedido
                let newElement = model.clone();        
                newElement.find("#orderNumber").text("Pedido Nº: " + order._id);
                newElement.find("#orderDate").text("Realizado em: " + order.date.getDate() + '/' + (order.date.getMonth()+1) + '/' + order.date.getFullYear() + " às " + order.date.getHours() + ':' + order.date.getMinutes());
                newElement.find("#buyerName").text(order.name);
                newElement.find("#address").text("Endereço: " + order.address);
                newElement.find("#tel").text("Telefone: " + order.tel);
                newElement.find("#itemTotal").text(order.itemTotal);
                newElement.find("#shipTotal").text(order.shipTotal);
                newElement.find("#orderTotal").text(order.orderTotal);
                
                // adiciona os produtos
                order.products.forEach(function(product){
                    let newItem = itemModel.clone();
                    newItem.find("#productPic img").attr('src', product.picture);
                    newItem.find("#productPic").attr('href', "javascript:changeHash('product-view-" + product.key + "')");
                    newItem.find("#productName").text(product.name);
                    newItem.find("#productName").attr('href', "javascript:changeHash('product-view-" + product.key + "')");
                    newItem.find("#productPrice").text("R$ " + product.price);
                    newItem.find("#productQtd").text(product.quantity);
                    newItem.find("#productSubtotal").text("R$ " + (product.price*product.quantity));
                    newElement.find("#item-list").append(newItem);
                });
                
                // adiciona o pedido na lista
                $("#order-list").append(newElement);
            }
        });
    });
}

function loadPageAdmOrders() {
	
	$("#adm-content").load("adm/orders.html", function() {
	
        let orderInfo = $('<tr/>');
        orderInfo.append($('<td id="orderNumber"></td>'));
        orderInfo.append($('<td id="orderClient"></td>'));
        orderInfo.append($('<td id="orderCpf"></td>'));
        orderInfo.append($('<td id="orderTotal"></td>'));
        orderInfo.append($('<td id="orderDate"></td>'));
        orderInfo.append($('<td><button type="button" id="orderDetail" class="btn btn-default">Detalhes</button></td>'));
        
        $.get('/orders/', function(result){
            let i;
			for(i = 0; i < result.length; i++){
				
				let order = result[i];
                let newInfo = orderInfo.clone();
				
                newInfo.find('#orderNumber').text(order._id);
                newInfo.find('#orderClient').text(order.name);
                newInfo.find('#orderCpf').text(order.user);
                newInfo.find('#orderTotal').text(order.orderTotal);
                newInfo.find('#orderDate').text(order.date.getDate() + '/' + (order.date.getMonth()+1) + '/' + order.date.getFullYear() + " - " + order.date.getHours() + ':' + order.date.getMinutes());
                newInfo.find("#orderDetail").attr('onClick', "changeHash('order-detail-" + order._id + "')");
                
                $("#ordersTable").append(newInfo);
            
            }
        });
	});
}

function showStock() {
	
	$("#adm-content").load("adm/stock.html", function() {
	
        let productInfo = $('<tr/>');
        productInfo.append($('<td class="productName"></td>'));
        productInfo.append($('<td class="productQuantity"></td>'));
        productInfo.append($('<td class="productPrice"></td>'));
        productInfo.append($('<td class="productAnimal"></td>'));
        productInfo.append($('<td class="productCategory"></td>'));
        productInfo.append($('<td><button type="button" id="productEdit" class="btn btn-default">Alterar</button></td>'));
        productInfo.append($('<td><button type="button" id="productRemove" class="btn btn-default">Deletar</button></td>'));
        
		let query = {};
        $.get('/products/', {product: query}, function(result){
            let i;
			for(i = 0; i < result.length; i++){
		
				product = result[i];
				
				let newInfo = productInfo.clone();

                newInfo.find('.productName').text(product.name);
                newInfo.find('.productQuantity').text(product.quantity);
                newInfo.find('.productPrice').text('R$ ' + product.price);
                newInfo.find('.productAnimal').text(product.animal);
                newInfo.find('.productCategory').text(product.category);
                newInfo.find("#productEdit").attr('onClick', "changeHash('product-edit-" + product._id + "')");
                newInfo.find("#productRemove").attr('onClick', "removeProduct(" + product._id + ")");
                
                $("#stockTable").append(newInfo);
            }
        });
	});
}

function removeProduct(productKey) {
  if (confirm("Você tem certeza que quer remover este produto?")) {
			$.delete('/products', {id: parseInt(productKey)}, function(result){
				showStock();
		});	
  }
  else return;
}

function modifyProduct (productKey) {
    $("#adm-content").load("adm/alter-product.html", function() {
        $.get('/product', {id: parseInt(productKey)}, function(result){
            let product = result;
            $("#name").val(product.name);
            $("#qtd").val(product.quantity);
            $("#price").val(product.price);
            $("#description").val(product.description);
            $("#picture").attr('src', product.picture);
            $("#save").attr('onClick', "saveProduct(" + product._id + ");");
        });
    });
}

function saveProduct(productKey) {
  
	let newProduct = {	_id: productKey,
					name: $("#name").val(),
					quantity: parseInt($("#qtd").val()),
					price: $("#price").val(),
					description: $("#description").val(),
					};
					
    $.put('product-modify', {product: JSON.stringify(newProduct)});
  	changeHash("adm-area");
}



function addProduct(){
    // vefica se os campos não estão vazios
    if($("#name").val().split(" ").join("") == "" || $("#price").val().split(" ").join("") == "" ){
        alert("Preencha todos os campos!");
        return;
    }
	
    // verifica se o preço é válido
  	if(!$.isNumeric($.trim($("#price").val()))){
        alert("O preço deve ser um número!");
        return;  		
  	}

    // obtem  o id do novo produto
    $.get('/product-id', function(result){

        // cria o objeto do novo produto
        let newProduct = {
          _id: parseInt(result.new_id),
          name: $.trim($("#name").val()), 
          quantity: parseInt($("#qtd").val()), 
          price: parseFloat($("#price").val()),
          animal: $("#animal").val(), 
          category: $("#category").val(), 
          description: $("#description").val(), 
          picture: "https://cdn.shopify.com/s/files/1/0364/6117/products/DSC0001_25a81afb-f969-4cb9-b760-b3dc038f0885_large.JPG?v=1464631702"
        };

        // adiciona o novo produto
        $.post('/new-product', {product: JSON.stringify(newProduct)}, function(result){
            if (result.success)
              changeHash("adm-area");
            else
              alert("Erro ao inserir produto");
        });
    });
}

function showAdmins() {
	
	$("#adminsTable").html("");
	
	let adminInfo = $('<tr/>');
	adminInfo.append($('<td class="adminsCPF"></td>'));
	adminInfo.append($('<td class="adminsName"></td>'));
	adminInfo.append($('<td class="adminsEmail"></td>'));
	adminInfo.append($('<td class="adminsTel"></td>'));
	adminInfo.append($('<td class="adminsAddress"></td>'));
	adminInfo.append($('<td><button type="button" id="adminRemove" class="btn btn-default">Deletar</button></td>'));
	
	let query = {};
        $.get('/users/', {user: query}, function(result){
            let i;
			for(i = 0; i < result.length; i++){
		
				user = result[i];
				
				if(user.isAdmin == true){
					
					if(user.cpf != "admin"){
					
						let newInfo = adminInfo.clone();
        
						newInfo.find('.adminsCPF').text(user.cpf);
						newInfo.find('.adminsName').text(user.name);
						newInfo.find('.adminsEmail').text(user.email);
						newInfo.find('.adminsTel').text(user.tel);
						newInfo.find('.adminsAddress').text(user.address);
						newInfo.find('#adminRemove').attr('onClick', "removeAdmin(" + user.cpf + ")");
			
						$("#adminsTable").append(newInfo);
					
					}
				}
					
			}
		});
}

function removeAdmin(adminKey) {
    if (confirm("Você tem certeza que quer remover este administrador?")) {
		adminKey = adminKey.toString();
		$.delete('/users', {id: adminKey}, function(result){
			showAdmins();
		});
    }
	else return;
}

function addAdmin(){
	
    if($("#registerCPF").val().split(" ").join("") == "" || $("#registerName").val().split(" ").join("") == "" || $("#registerTel").val().split(" ").join("") == "" || $("#registerAddress").val().split(" ").join("") == "" || $("#registerEmail").val().split(" ").join("") == "" || $("#registerPassword").val().split(" ").join("") == "" || $("#registerConfirmPassword").val().split(" ").join("") == ""){
            alert("Favor preencher todos os campos.");
            return;
    }
    else{
        let newAdmin = { cpf: $.trim($("#registerCPF").val()), 
						name: $.trim($("#registerName").val()), 
						tel: $.trim($("#registerTel").val()), 
						address: $.trim($("#registerAddress").val()), 
						email: $.trim($("#registerEmail").val()), 
						password: $("#registerPassword").val(), 
						profilePic: $("#registerProfilePic").val(), 
						isAdmin: true };
    
        if($("#registerConfirmPassword").val() == newAdmin.password){
			$.post('/new-admin', {admin: JSON.stringify(newAdmin)}, function(result){
				if (result.success)
					changeHash("adm-area");
				else{
					alert("Erro ao inserir administrador (já existe um administrador com o CPF utilizado)");
					return;
				}
			});
            changeHash('adm-area');
        }
        else{
            alert("Erro na confirmação de senha!");
        }
    }
	
}

function showCustomers() {
	
  $("#adm-content").load("adm/clients.html").ready(function(){
	
	let customerInfo = $('<tr/>');
	customerInfo.append($('<td class="usersCPF"></td>'));
	customerInfo.append($('<td class="usersName"></td>'));
	customerInfo.append($('<td class="usersEmail"></td>'));
	customerInfo.append($('<td class="usersTel"></td>'));
	customerInfo.append($('<td class="usersAddress"></td>'));
	customerInfo.append($('<td><button type="button" id="userRemove" class="btn btn-default">Deletar</button></td>'));
	
	let query = {};
        $.get('/users/', {user: query}, function(result){
            let i;
			for(i = 0; i < result.length; i++){
		
				user = result[i];
				
				if(user.isAdmin == false){
					
					let newInfo = customerInfo.clone();
        
					newInfo.find('.usersCPF').text(user.cpf);
					newInfo.find('.usersName').text(user.name);
					newInfo.find('.usersEmail').text(user.email);
					newInfo.find('.usersTel').text(user.tel);
					newInfo.find('.usersAddress').text(user.address);
					newInfo.find("#userRemove").attr('onClick', "removeUser('" + user.cpf + "')");
			
					$("#usersTable").append(newInfo);
				}
					
			}
		});
	});
}

//FUNÇÃO INCOMPLETA
function removeUser(userKey) {
    if (confirm("Você tem certeza que quer remover este cliente?")) {
		$.delete('/users', {id: userKey}, function(result){
			$.delete('/petByUser', {id: userKey}, function(result){
				showCustomers();
			});
		});
    }
	else return;
}

/* FUNÇÕES PARA ADIÇÃO DE EXEMPLOS NO BANCO: */

// adiciona usuários de exemplo
function addUsers(objectStore){
    
    //dados dos usuários iniciais
    const userData = [
        { cpf: "admin", name: "Bill", tel: "123", address: "Rua 1", email: "bill@mypet.com", password: "admin", profilePic:"http://meganandtimmy.com/wp-content/uploads/2012/09/4ce4a17fb7f35-447x600.jpg", isAdmin: true },
        { cpf: "321", name: "Jubileu", tel: "321", address: "Rua 3", email: "jubileu@gmail.com", password: "321", profilePic:"https://pbs.twimg.com/media/C3BxfpmWIAAGJpw.jpg", isAdmin: false }
    ];
    
    //inserção dos usuários no banco de dados
    for (let i in userData) {
        objectStore.add(userData[i]);
    }
}

// adiciona pets de exemplo
function addPets(objectStore){
    
    //dados dos pets iniciais
    const petsData = [
        { owner: "321", name: "Rex", species: "Cachorro", age: 5, gender: "Masculino", breed:"Golden Retriever" , petPic:"http://portaldodog.com.br/cachorros/wp-content/uploads/2015/05/golden-retriever-8-375x500.jpg"},
        { owner: "321", name: "Melinda", species: "Gato", age: 2, gender: "Feminino", breed:"Siamês" , petPic:"http://cdn2-www.cattime.com/assets/uploads/gallery/siamese-cats-and-kittens-pictures/siamese-cat-kitten-picture-5.jpg"},
        { owner: "admin", name: "Lassie", species: "Cachorro", age: 3, gender: "Feminino", breed:"Husky Siberiano" , petPic:"https://upload.wikimedia.org/wikipedia/commons/a/a3/Black-Magic-Big-Boy.jpg"}
    ];
        
    //inserção dos pets no banco de dados
    for (let i in petsData) {
        objectStore.add(petsData[i]);
    }
}

// adiciona serviços de exemplo
function addServicer(objectStore) {
    const serviceData = [
        { name: ""}
    ];
}

// adiciona produtos de exemplo
function addProducts(objectStore){
    
    const stockData = [
        { name: "Ração Royal Canin Maxi - Cães Adultos - 15kg", quantity: 200, price: "209.99", animal: "Cachorro", category: "Alimentos", picture: "https://cdn-petz-imgs.stoom.com.br/fotos/1515444639412.jpg", description:`- Indicado para cães adultos de grande porte;
- Oferece todos os nutrientes que seu cão de grande porte precisa para uma vida longa e saudável;
- Especialmente formulada para favorecer a saúde dos ossos e articulações também preserva a tonicidade muscular graças a um aporte adequado de proteínas;
- Assegura uma ótima digestão e atende até mesmo os paladares mais exigentes;
- Disponível em embalagem de 15kg.` }, 
        { name: "Ração Royal Canin Golden Retriever - Cães Adultos - 12kg", quantity: 100, price: "204.99", animal: "Cachorro", category: "Alimentos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/1515429480749.jpg",description:`- Indicado para cães
- Ajuda na manutenção ideal do peso do seu pet
- Contribui para o funcionamento da musculatura cardíaca
- Auxilia na eliminação dos efeitos do envelhecimento celular
- Disponível em embalagem de 12kg` },
		{ name: "Royal Canin Renal Veterinary Diet Cães - 10kg", quantity: 10, price: "289.99", animal: "Cachorro", category: "Alimentos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/1458082860525.jpg", description:`- Indicada para cães adultos;
- Recomendado para cães com insuficiência renal crônica;
- Ajuda a eliminar e prevenir a formação de radicais livres;
- Equilibra o sistema digestivo,` },
		{ name: "Ração Royal Canin Veterinary Hypoallergenic - Gatos Adultos - 1,5kg", quantity: 150, price: "104.99", animal: "Gato", category: "Alimentos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/1507918511559.jpg", description:`- Indicada para gatos adultos e alérgicos;
- Proteínas hidrolisadas que tornam o alimento altamente digestivo e com baixo potencial alergênico;
- Complexo patenteado que ajuda a reforçar a barreira cutânea;
- Enriquecido com EPA/DHA;` },
		{ name: "Ração Royal Canin Premium Cat Vitalidade para Gatos Adultos - 10kg", quantity: 180, price: "134.94", animal: "Gato", category: "Alimentos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/1508264968346.jpg", description:`- Indicada para gatos adultos;
- Alimentação completa e balanceada;
- Sabor irresistível para seu gatinho;
- Favorece a saúde do trato urinário;` },
		{ name: "Ração Royal Canin Premium Cat Beleza da Pelagem para Gatos Adultos - 10kg", quantity: 50, price: "134.99", animal: "Gato", category: "Alimentos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/1508264680318.jpg", description:`- Indicada para gatos adultos;
- Formula altamente palatável;
- Promove a saúde do trato urinário;
- Enriquecida com ômegas 3 e 6 proporcionando beleza da pelagem;` },
		{ name: "Brinquedo Chalesco Para Cães Pelúcia Cachorro Luxo Rosa e Azul", quantity: 20, price: "34.99", animal: "Cachorro", category: "Brinquedos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/1458848516726.jpg", description:`- Indicado para cães;
- Divertido e criativo;
- Ajuda a combater o estresse do seu pet;
- Possui textura macia de pelúcia.` },
		{ name: "Brinquedo Chalesco Para Cães Pelúcia Hamburguer Colorido", quantity: "30", price: "19.19", animal: "Cachorro", category: "Brinquedos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/10037080001297-1.jpg", description:`Você sabia que cães que permanecem longos períodos sem seus donos, sem uma atividade física, sem estímulos, podem se tornar animais deprimidos? Por isso a Chalesco criou o brinquedo Chalesco Para Cães Pelúcia Hamburguer Colorido, que além de apresentar formato criativo e divertido, possui textura macia de pelúcia. ` },
		{ name: "Brinquedo de Pelúcia Chalesco Crocodilo", quantity: "40", price: "20.99", animal: "Cachorro", category: "Brinquedos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/1457992186939.jpg", description:`- Indicado para cães;
- Divertido e criativo;
- Ajuda a combater o estresse do seu pet;
- Possui textura macia de pelúcia.` },
		{ name: "Arranhador 4 Estações Para Gatos Cone Sisal com Penas", quantity: 20, price: "209.99", animal: "Gato", category: "Brinquedos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/20037081000050-1.jpg", description:`O Arranhador 4 Estações Para Gatos Cone Sisal com Penas foi desenvolvido para proporcionar atividades físicas, evitando o stress preservando seus móveis. Um lugar adequado para arranhar, dormir e brincar. Tem um design bonito que pode situar-se em qualquer lugar da sua casa. Para evitar que o seu gato estrague móveis, paredes ou sofás, tenha a certeza de lhe proporcionar um lugar adequado para arranhar, assim poderá esticar-se, espreguiçar-se e afiar as suas unhas. Tamanho: 80cm. ` },
		{ name: "Brinquedo Chalesco Kit com 2 Ratinhos de Corda", quantity: 100, price: "20.99", animal: "Gato", category: "Brinquedos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/1457992630932.jpg", description:`- Indicado para gatos;
- Provoque seu gatinho para brincar com estes ratinhos que são pura diversão;
- Feitos de tecido de algodão, são ideais para seu melhor amigo que precisa diariamente de uma boa dose de entretenimento.` },
		{ name: "Brinquedo Jambo Gatos Joaninha Amarelo e Preto Vibratória", quantity: 50, price: "19.99", animal: "Gato", category: "Brinquedos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/1455921490800.jpg", description:`Presentear seu gatinho é uma forma divertida de descontrair o seu animal de estimação e evitar que eles mordam os móveis da sua casa. O Brinquedo Jambo Pet Gatos Joaninha Amarelo e Preto Vibratória é feito em poliéster e é perfeito para seu gatinho gastar as energias, pois vem com um dispositivo que vibra, deixando seu pet instigado durante longos períodos de tempo. ` }
		
    ];
    
    //inserção dos produtos no banco de dados
    for (let i in stockData) {
        objectStore.add(stockData[i]);
    }
}
