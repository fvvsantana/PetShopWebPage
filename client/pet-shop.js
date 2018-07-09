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
    
    // criação da "tabela" do carrinho
    let cartStore = db.createObjectStore("cart", { keyPath: "key" });
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
    // obtem o id do pedido
    $.get('/get-id', {type: 'order_id'}, function(result){
        // cria o objeto com dados do pedido
        let order = {
            _id: result.new_id,
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
                
                // remove os produtos do carrinho
                cursor.delete();
                cursor.continue();
            }
            else {
                // após remover todos itens do carrinho, salvar o pedido no banco
                $.post('/new-order', {order: JSON.stringify(order)}, function(result){
                  if (result.success) {
                    alert("Pedido realizado com sucesso!");
                    changeHash("my-cart");
                  }
                  else
                    alert("Não foi possível registrar o pedido.");
                });
            }
        };
    });
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
            $.get('/product/', {id: productKey}, function(product){
                let newItem = {
                    key: product._id,
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
            });
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
          result.forEach(function(pet){
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
          });
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
        
        // carrega a lista de pedidos
        $.get('/user-orders', {user: userSession.cpf}, function(result){
            result.forEach(function(order){
                // cria o elemento do pedido
                let newElement = model.clone();        
                newElement.find("#orderNumber").text("Pedido Nº: " + order._id);
                let d = new Date(order.date);
                newElement.find("#orderDate").text("Realizado em: " + d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear() + " às " + d.getHours() + ':' + d.getMinutes());
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
            });
        });
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
	
	  let loginInfo = {
        cpf: $("#user").val(),
				password: $("#password").val()
		};
    
    if(loginID == "" || loginPass == ""){
        alert("Preencha todos os campos!");
        return;
    }
		
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
        
        $.get('/order-details', {order_id: order}, function(order){
				
                // cria o elemento do pedido
                let newElement = model.clone();        
                newElement.find("#orderNumber").text("Pedido Nº: " + order._id);
                let d = new Date(order.date);
                newElement.find("#orderDate").text("Realizado em: " + d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear() + " às " + d.getHours() + ':' + d.getMinutes());
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
        
      $.get('/all-orders', function(result){
          result.forEach(function(order){
              let newInfo = orderInfo.clone();
              newInfo.find('#orderNumber').text(order._id);
              newInfo.find('#orderClient').text(order.name);
              newInfo.find('#orderCpf').text(order.user);
              newInfo.find('#orderTotal').text(order.orderTotal);
              let d = new Date(order.date);
              newInfo.find('#orderDate').text(d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear() + " - " + d.getHours() + ':' + d.getMinutes());
              newInfo.find("#orderDetail").attr('onClick', "changeHash('order-detail-" + order._id + "')");
              $("#ordersTable").append(newInfo);
          });
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
    $.get('/get-id', {type: 'product_id'}, function(result){

        console.log(parseInt(result.new_id));
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
