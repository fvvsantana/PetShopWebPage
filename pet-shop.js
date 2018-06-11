//Inicio da organização do IndexedDB
let db;

//Inicialmente não há um usuário logado
let userLoggedIn = false;

//Dados do usuário que estiver em uma sessão estarão aqui
let userSession = {name: "", cpf: "", email: "", address: "", tel:"", profilePic: "", isAdmin: false};

//abertura do banco de dados
let request = indexedDB.open("HappyPet_db", 1);

// leitura do banco (caso já exista)
request.onsuccess = function(event) {
    db = event.target.result;
}

// criação do banco (caso necessário)
request.onupgradeneeded = function(event) {
    
    db = event.target.result;

    //criação da "tabela" de usuários
    let userStore = db.createObjectStore("users", { keyPath: "cpf" });
    addUsers(userStore);
    
    //criação da "tabela" de pets
    let petStore = db.createObjectStore("pets", { autoIncrement : true });
    petStore.createIndex("owner", "owner", { unique: false });
    addPets(petStore);
	
    //criação da "tabela" de produtos
    let productsStore = db.createObjectStore("products", { autoIncrement : true });
    productsStore.createIndex("animal", "animal", {unique: false});
    productsStore.createIndex("animal-category", ["animal", "category"], {unique: false});
    addProducts(productsStore);
    
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
      if (location.hash.startsWith("#pet-edit")) {
          loadPageEditPet(location.hash.split('-')[2]);
          return;
      }
	  if (location.hash.startsWith("#product-edit")) {
          modifyProduct(location.hash.split('-')[2]);
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
		  
		 case"#addProduct":
			content.load("new-product.html");

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
          $("#adm-content").load("adm/services-not-ready.html");
          break;

        case "#adm-sessions":
          $("#adm-content").load("adm/sessions-not-ready.html");
          break;

        case "#adm-stock":
			showStock();
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
          loadPageMyOrder();
          break;
          
        case "#add-pet":
          $("#my-area-content").load("new-pet.html");
          break;
		
		case "#my-profile-edit":
          loadPageEditProfile();
          break;

        case "#login":
          content.load("login.html");
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

        case "#service-schedule":
          content.load("service-schedule.html");
          break;

        case "#service-view":
          content.load("service-view.html");
          break;

        case "#services":
          content.load("services.html");
          break;

        default:
          content.load("not-found.html");
          break;
      }
    });

    $(window).trigger('hashchange');

});

function loadPageConfirmation() {
    if (!userLoggedIn) {
        alert("Por favor, faça login para continuar.");
        changeHash('login');
    } else {
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

function loadPageEditProfile() {
    $("#my-area-content").load("my-profile-edit.html", function() {
        $("#registerName").val(userSession.name);
        $("#registerCPF").val(userSession.cpf);
        $("#registerEmail").val(userSession.email);
        $("#registerTel").val(userSession.tel);
        $("#registerAddress").val(userSession.address);
    });
}

function changePersonalData() {
    $("#content").load("my-area.html", function() {
        changeHash("my-profile-edit");
    });
}

function changeDeliverAdress() {
    alert("Funcionalidade não implementada");
}

function finishOrder() {
    if($("#number").val().split(" ").join("") == "" || $("#name").val().split(" ").join("") == "" || $("#date").val().split(" ").join("") == "" || $("#code").val().split(" ").join("") == "") {
        alert("Favor preencher todos os campos.");
        return;
    } else {
        let objectStore = db.transaction("cart", "readwrite").objectStore("cart");
        objectStore.openCursor().onsuccess = function(event) {
            let cursor = event.target.result;
            if (cursor) {
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
                alert("Pedido realizado com sucesso!");
                changeHash("my-cart");
            }
        }
    }
}

function loadPageEditPet (petKey) {
    $("#my-area-content").load("pet-edit.html", function() {
        let objectStore = db.transaction("pets", "readonly").objectStore("pets");
        objectStore.openCursor(parseInt(petKey)).onsuccess = function(event) {
            let cursor = event.target.result;
            if (cursor) {
                $("#name").val(cursor.value.name);
                $("#age").val(cursor.value.age);
                $("#species").val(cursor.value.species);
                $("#gender").val(cursor.value.gender);
                $("#breed").val(cursor.value.breed);
                $("#save").attr('onClick', "savePet(" + petKey + ");");
            }
        }
    });
}

function removePet(petKey) {
    if (confirm("Você tem certeza que quer remover este pet?")) {
        let objectStore = db.transaction("pets", "readwrite").objectStore("pets");
        let request = objectStore.delete(parseInt(petKey));
        request.onerror = function(event) {
            alert("Erro ao remover pet");
        };
        request.onsuccess = function(event) {
            loadPageMyPet();
        }
    }
}

function savePet(petKey) {
    // abre a tabela para escrita
    let objectStore = db.transaction("pets", "readwrite").objectStore("pets");
    
    // chave igual a zero significa que é um novo pet
    if (petKey == 0) {
        let newPet = { 
            owner: userSession.cpf, 
            name: $("#name").val(), 
            species: $("#species").val(), 
            age: $("#age").val(), 
            gender: $("#gender").val(), 
            breed: $("#breed").val(), 
            petPic:"https://i.ytimg.com/vi/z4Ysnd2bBJA/maxresdefault.jpg"};
        if (newPet.species == "Gato")
            newPet.petPic = "http://tabooh.info/wp-content/uploads/drawing-of-cats-cat-drawing-images-insssrenterprisesco-drawings-of-cats-bik-drawing.jpg";
        
        request = objectStore.add(newPet);
        request.onerror = function(event) {
            alert("Erro ao adicionar pet");
        };
        request.onsuccess = function(event) {
            changeHash("my-pets");
        }
    }
    // se a chave não é zero, está editando um pet existente
    else {
        objectStore.get(parseInt(petKey)).onsuccess = function(event) {
            let pet = event.target.result;
            pet.name = $("#name").val();
            pet.age = $("#age").val();
            pet.species = $("#species").val();
            pet.gender = $("#gender").val();
            pet.breed = $("#breed").val();
            
            let requestUpdate = objectStore.put(pet, petKey);
            requestUpdate.onerror = function(event) {
                alert("Erro ao atualizar pet");
            };
            requestUpdate.onsuccess = function(event) {
                changeHash("my-pets");
            }
        }
    }
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
    let objectStore = db.transaction("cart", "readwrite").objectStore("cart");
    objectStore.openCursor(parseInt(productKey)).onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            let item = cursor.value;
            item.quantity = $('#itemQuantity-' + productKey).val();
            
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
    $("#content").load("product-view.html", function() {
        let objectStore = db.transaction("products", "readonly").objectStore("products");
        objectStore.openCursor(parseInt(productKey)).onsuccess = function(event) {
            let cursor = event.target.result;
            if (cursor) {
                $("#productImage").attr('src', cursor.value.picture);
                $("#productName strong").text(cursor.value.name);
                $("#productPrice").text("R$ " + cursor.value.price);
                $("#productDesc").text(cursor.value.description);
                $("#productCart").attr('onclick', "addCart('" + productKey + "')");
            } else {
                $("#productName strong").text("Produto não encontrado");
                $("#productPrice").text("R$ ??");
            }
        } 
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
        
        // open the objectStore
        let objectStore = db.transaction("products").objectStore("products");
        let request;
        
        // show all products
        if (data.length == 1) {
            $("#title").text("Todos os produtos");
            request = objectStore.openCursor();
        }
        // show products for only one animal
        else if (data.length == 2) {
            $("#title").text("Produtos para " + data[1] + "s");
            request = objectStore.index("animal").openCursor(capitalizeFirstLetter(data[1]));
        }
        // show products for only one animal and one category
        else {
            $("#title").text(capitalizeFirstLetter(data[2]) + " para " + data[1] + "s");
            request = objectStore.index("animal-category").openCursor([capitalizeFirstLetter(data[1]),capitalizeFirstLetter(data[2])]);
        }
        
        request.onsuccess =  event => {
            let cursor = event.target.result;
            if(cursor){
                let product = cursor.value;
                let newElement = model.clone();
                newElement.find("#productImage").attr('src', product.picture);
                newElement.find("#productTitle").text(product.name);
                newElement.find("#productPrice").text("R$ " + product.price);
                newElement.find("a").attr('href', "javascript:changeHash('product-view-" + cursor.primaryKey + "')");
                $("#products-section > .row").append(newElement);
                cursor.continue();
            }
        }
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
        
        let objectStore = db.transaction("pets", "readonly").objectStore("pets").index("owner");
        objectStore.openCursor(userSession.cpf).onsuccess = function(event) {
            let cursor = event.target.result;
            if (cursor) {
                let newElement = model.clone();        
                newElement.find("#petPic").attr('src', cursor.value.petPic);
                newElement.find("#petName").text(cursor.value.name);
                newElement.find("#petSpecies").text(cursor.value.species);
                newElement.find("#petAge").text(cursor.value.age);
                newElement.find("#petGender").text(cursor.value.gender);
                newElement.find("#petBreed").text(cursor.value.breed);
                newElement.find("#petEdit").attr('onClick', "changeHash('pet-edit-" + cursor.primaryKey + "')");
                newElement.find("#petRemove").attr('onClick', "removePet(" + cursor.primaryKey + ")");
                $("#petList").append(newElement);
                
                cursor.continue();
            }
        }
    });
}

function loadPageMyOrder() {
    $("#my-area-content").load("my-orders.html");
}

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
                    // set user as logged in 
                    userLoggedIn = true;
                    
                    // get the user data
                    userSession.name = cursor.value.name;
                    userSession.cpf = cursor.value.cpf;
                    userSession.email = cursor.value.email;
                    userSession.address = cursor.value.address;
                    userSession.tel = cursor.value.tel;
                    userSession.profilePic = cursor.value.profilePic;
                    userSession.isAdmin = cursor.value.isAdmin;
                    
                    // update the header according to the user type
                    if (userSession.isAdmin) {
                        $("#loginButton").text("Área do Administrador");
                        $("#cartButton").hide();
                        changeHash('adm-area');
                    } else {
                        $("#loginButton").text("Minha Área");
                        changeHash('my-area');
                    }
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
    // reset buttons
    $("#loginButton").text("Login");
    $("#cartButton").show();
    
    // finish session variables
    userSession = {name: "", cpf: "", email: "", address: "", tel:"", profilePic: "", isAdmin: false};
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
        }
    
        if($("#registerConfirmPassword").val() == newUser.password){
			let objectStore = db.transaction("users","readwrite").objectStore("users");
            let request = objectStore.put(newUser);
            request.onerror = function(event) {
                alert("Erro ao salvar a conta");
            };
            request.onsuccess = function(event) {
                changeHash("my-area");
            }
        }
        else{
            alert("Erro na confirmação de senha!");
        }
    }
}

function editAccount(){

    let objectStore = db.transaction("users", "readwrite").objectStore("users");
    let request = objectStore.openCursor(userSession.cpf);
    request.onsuccess =  event => {
        
        let cursor = event.target.result;
        if($("#editEmail").val().split(" ").join("") != ""){

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
		let objectStore = db.transaction(["users"], "readwrite").objectStore("users");
        let requestUpdate = objectStore.put(cursor.value);
        changeHash('my-area');
    }
}

function showStock() {
	
	$("#adm-content").load("adm/stock.html").ready(function() {
	
        let productInfo = $('<tr/>');
        productInfo.append($('<td class="productName"></td>'));
        productInfo.append($('<td class="productQuantity"></td>'));
        productInfo.append($('<td class="productPrice"></td>'));
        productInfo.append($('<td class="productAnimal"></td>'));
        productInfo.append($('<td class="productCategory"></td>'));
        productInfo.append($('<td><button type="button" id="productEdit" class="btn btn-default">Alterar</button></td>'));
        productInfo.append($('<td><button type="button" id="productRemove" class="btn btn-default">Deletar</button></td>'));
        
        let objectStore = db.transaction(["products"], "readonly").objectStore("products");
        objectStore.openCursor().onsuccess = function(event) {
            let cursor = event.target.result;
            if (cursor) {
                let newInfo = productInfo.clone();

                newInfo.find('.productName').text(cursor.value.name);
                newInfo.find('.productQuantity').text(cursor.value.quantity);
                newInfo.find('.productPrice').text('R$ ' + cursor.value.price);
                newInfo.find('.productAnimal').text(cursor.value.animal);
                newInfo.find('.productCategory').text(cursor.value.category);
                newInfo.find("#productEdit").attr('onClick', "changeHash('product-edit-" + cursor.primaryKey + "')");
                newInfo.find("#productRemove").attr('onClick', "removeProduct(" + cursor.primaryKey + ")");
                
                $("#stockTable").append(newInfo);
            
                cursor.continue();
            }
        }
	});
}

function removeProduct(productKey) {
    if (confirm("Você tem certeza que quer remover este produto?")) {
        let objectStore = db.transaction("products", "readwrite").objectStore("products");
        let request = objectStore.delete(parseInt(productKey));
        request.onerror = function(event) {
            alert("Erro ao remover produto");
        };
        request.onsuccess = function(event) {
            showStock();
        }
    }
}

function modifyProduct (productKey) {
    $("#adm-content").load("adm/alter-product.html", function() {
        let objectStore = db.transaction("products", "readonly").objectStore("products");
        objectStore.openCursor(parseInt(productKey)).onsuccess = function(event) {
            let cursor = event.target.result;
            if (cursor) {
                $("#name").val(cursor.value.name);
                $("#qtd").val(cursor.value.quantity);
                $("#price").val(cursor.value.price);
                $("#description").val(cursor.value.description);
				$("#picture").attr('src', cursor.value.picture);
                $("#save").attr('onClick', "saveProduct(" + productKey + ");");
            }
        }
    });
}

function saveProduct(productKey) {
    // abre a tabela para escrita
    let objectStore = db.transaction("products", "readwrite").objectStore("products");
    
    // chave igual a zero significa que é um novo produto
    if (productKey == 0) {
        let newProduct = {  
            name: $("#name").val(), 
            quantity: $("#qtd").val(), 
            price: $("#price").val(), 
            description: $("#description").val()};
        
        request = objectStore.add(newProduct);
        request.onerror = function(event) {
            alert("Erro ao adicionar produto");
        };
        request.onsuccess = function(event) {
            changeHash("adm-area");
        }
    }
    // se a chave não é zero, está editando um produto existente
    else {
		objectStore.get(parseInt(productKey)).onsuccess = function(event) {
			let product = event.target.result;
			product.name = $("#name").val();
			product.quantity = $("#qtd").val();
			product.price = $("#price").val();
			product.description = $("#description").val();
            
			let requestUpdate = objectStore.put(product, productKey);
			requestUpdate.onerror = function(event) {
				alert("Erro ao atualizar produto");
			};
			requestUpdate.onsuccess = function(event) {
				changeHash("adm-area");
			}
		}
	}
}


function addProduct(){
	
    if($("#name").val().split(" ").join("") == "" || $("#price").val().split(" ").join("") == "" ){
            alert("Preencha todos os campos!");
            return;
    }
	
	if($.isNumeric($.trim($("#price").val()))){
		
		let newProduct = { name: $.trim($("#name").val()) , quantity: $("#qtd").val(), price: $.trim($("#price").val()), animal: $("#animal").val(), category: $("#category").val(), description: $.trim($("#description").val()), picture: "https://cdn.shopify.com/s/files/1/0364/6117/products/DSC0001_25a81afb-f969-4cb9-b760-b3dc038f0885_large.JPG?v=1464631702"};
		
		
		let objectStore = db.transaction(["products"], "readwrite").objectStore("products");
        objectStore.add(newProduct);
		changeHash("adm-area");
		
	}
	else{
		alert("O preço deve ser um número!");
	}
	
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
	
	let objectStore = db.transaction(["users"], "readonly").objectStore("users");
    objectStore.openCursor().onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
			
			if(cursor.value.isAdmin == true){
				
				if(cursor.value.cpf != "admin"){
				
					let newInfo = adminInfo.clone();

					newInfo.find('.adminsCPF').text(cursor.value.cpf);
					newInfo.find('.adminsName').text(cursor.value.name);
					newInfo.find('.adminsEmail').text(cursor.value.email);
					newInfo.find('.adminsTel').text(cursor.value.tel);
					newInfo.find('.adminsAddress').text(cursor.value.address);
					newInfo.find("#adminRemove").attr('onClick', "removeAdmin(" + cursor.primaryKey + ")");
			
					$("#adminsTable").append(newInfo);
				
				}
				
			}
		
			cursor.continue();
		}
	}
}

function removeAdmin(adminKey) {
    if (confirm("Você tem certeza que quer remover este administrador?")) {
		adminKey = adminKey.toString();
        let objectStore = db.transaction("users", "readwrite").objectStore("users");
        let request = objectStore.delete(adminKey);
        request.onerror = function(event) {
            alert("Erro ao remover administrador");
        };
        request.onsuccess = function(event) {
            showAdmins();
        };
    }
}

function addAdmin(){
	
    if($("#registerCPF").val().split(" ").join("") == "" || $("#registerName").val().split(" ").join("") == "" || $("#registerTel").val().split(" ").join("") == "" || $("#registerAddress").val().split(" ").join("") == "" || $("#registerEmail").val().split(" ").join("") == "" || $("#registerPassword").val().split(" ").join("") == "" || $("#registerConfirmPassword").val().split(" ").join("") == ""){
            alert("Favor preencher todos os campos.");
            return;
    }
    else{
        let newUser = { cpf: $.trim($("#registerCPF").val()), name: $.trim($("#registerName").val()), tel: $.trim($("#registerTel").val()), address: $.trim($("#registerAddress").val()), email: $.trim($("#registerEmail").val()), password: $("#registerPassword").val(), profilePic: $("#registerProfilePic").val(), isAdmin: true };
    
        if($("#registerConfirmPassword").val() == newUser.password){
			let objectStore = db.transaction(["users"],"readwrite").objectStore("users");
            objectStore.add(newUser);
            
            changeHash('adm-area');
        }
        else{
            alert("Erro na confirmação de senha!");
        }
    }
	
}

function showCustomers() {
	
  $("#adm-content").load("adm/users.html").ready(function(){
	
	let customerInfo = $('<tr/>');
	customerInfo.append($('<td class="usersCPF"></td>'));
	customerInfo.append($('<td class="usersName"></td>'));
	customerInfo.append($('<td class="usersEmail"></td>'));
	customerInfo.append($('<td class="usersTel"></td>'));
	customerInfo.append($('<td class="usersAddress"></td>'));
	customerInfo.append($('<td><button type="button" id="userRemove" class="btn btn-default">Deletar</button></td>'));
	
	let transaction = db.transaction("users", "readonly").objectStore("users").openCursor();
    transaction.onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
			
			if(cursor.value.isAdmin == false){
				
				let newInfo = customerInfo.clone();
        
				newInfo.find('.usersCPF').text(cursor.value.cpf);
				newInfo.find('.usersName').text(cursor.value.name);
				newInfo.find('.usersEmail').text(cursor.value.email);
				newInfo.find('.usersTel').text(cursor.value.tel);
				newInfo.find('.usersAddress').text(cursor.value.address);
				newInfo.find("#userRemove").attr('onClick', "removeUser(" + cursor.primaryKey + ")");
			
				$("#usersTable").append(newInfo);
					
			}
		
			cursor.continue();
		}
	};
    transaction.onerror = function(event) {
        alert("Erro ao carregar clientes")
    }
    
  });
}

function removeUser(userKey) {
    if (confirm("Você tem certeza que quer remover este cliente?")) {
		userKey = userKey.toString();
		
        let objectStore = db.transaction("users", "readwrite").objectStore("users");
        let request = objectStore.delete(userKey);
        request.onerror = function(event) {
            alert("Erro ao remover cliente");
        };
        request.onsuccess = function(event) {
			let petsStore = db.transaction("pets", "readwrite").objectStore("pets").index("owner");
			let petsDelete = petsStore.openKeyCursor(userKey);       
			petsDelete.onsucess = function(){
				let cursor = petsDelete.result;
				if(cursor){
					petsStore.delete(cursor.key);
					cursor.continue;
				}
				
			}
			showCustomers();
		}
    }
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
