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
    addProducts(productsStore);
};

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
    
    //dados dos usuários iniciais
    const stockData = [
        { name: "Ração Royal Canin Maxi - Cães Adultos - 15kg", quantity: "200", price: "209.99", animal: "Cachorro", category: "Alimentos", picture: "https://cdn-petz-imgs.stoom.com.br/fotos/1515444639412.jpg", description:`- Indicado para cães adultos de grande porte;
- Oferece todos os nutrientes que seu cão de grande porte precisa para uma vida longa e saudável;
- Especialmente formulada para favorecer a saúde dos ossos e articulações também preserva a tonicidade muscular graças a um aporte adequado de proteínas;
- Assegura uma ótima digestão e atende até mesmo os paladares mais exigentes;
- Disponível em embalagem de 15kg.` }, 
        { name: "Ração Royal Canin Golden Retriever - Cães Adultos - 12kg", quantity: "100", price: "204.99", animal: "Cachorro", category: "Alimentos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/1515429480749.jpg",description:`- Indicado para cães
- Ajuda na manutenção ideal do peso do seu pet
- Contribui para o funcionamento da musculatura cardíaca
- Auxilia na eliminação dos efeitos do envelhecimento celular
- Disponível em embalagem de 12kg` },
		{ name: "Royal Canin Renal Veterinary Diet Cães - 10kg", quantity: "10", price: "289.99", animal: "Cachorro", category: "Alimentos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/1458082860525.jpg", description:`- Indicada para cães adultos;
- Recomendado para cães com insuficiência renal crônica;
- Ajuda a eliminar e prevenir a formação de radicais livres;
- Equilibra o sistema digestivo,` },
		{ name: "Ração Royal Canin Veterinary Hypoallergenic - Gatos Adultos - 1,5kg", quantity: "150", price: "104.99", animal: "Gato", category: "Alimentos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/1507918511559.jpg", description:`- Indicada para gatos adultos e alérgicos;
- Proteínas hidrolisadas que tornam o alimento altamente digestivo e com baixo potencial alergênico;
- Complexo patenteado que ajuda a reforçar a barreira cutânea;
- Enriquecido com EPA/DHA;` },
		{ name: "Ração Royal Canin Premium Cat Vitalidade para Gatos Adultos - 10kg", quantity: "180", price: "134.94", animal: "Gato", category: "Alimentos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/1508264968346.jpg", description:`- Indicada para gatos adultos;
- Alimentação completa e balanceada;
- Sabor irresistível para seu gatinho;
- Favorece a saúde do trato urinário;` },
		{ name: "Ração Royal Canin Premium Cat Beleza da Pelagem para Gatos Adultos - 10kg", quantity: "50", price: "134.99", animal: "Gato", category: "Alimentos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/1508264680318.jpg", description:`- Indicada para gatos adultos;
- Formula altamente palatável;
- Promove a saúde do trato urinário;
- Enriquecida com ômegas 3 e 6 proporcionando beleza da pelagem;` },
		{ name: "Brinquedo Chalesco Para Cães Pelúcia Cachorro Luxo Rosa e Azul", quantity: "20", price: "34.99", animal: "Cachorro", category: "Brinquedos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/1458848516726.jpg", description:`- Indicado para cães;
- Divertido e criativo;
- Ajuda a combater o estresse do seu pet;
- Possui textura macia de pelúcia.` },
		{ name: "Brinquedo Chalesco Para Cães Pelúcia Hamburguer Colorido", quantity: "30", price: "19.19", animal: "Cachorro", category: "Brinquedos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/1458848516726.jpg", description:`Você sabia que cães que permanecem longos períodos sem seus donos, sem uma atividade física, sem estímulos, podem se tornar animais deprimidos? Por isso a Chalesco criou o brinquedo Chalesco Para Cães Pelúcia Hamburguer Colorido, que além de apresentar formato criativo e divertido, possui textura macia de pelúcia. ` },
		{ name: "Brinquedo de Pelúcia Chalesco Crocodilo", quantity: "40", price: "20.99", animal: "Cachorro", category: "Brinquedos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/1457992186939.jpg", description:`- Indicado para cães;
- Divertido e criativo;
- Ajuda a combater o estresse do seu pet;
- Possui textura macia de pelúcia.` },
		{ name: "Arranhador 4 Estações Para Gatos Cone Sisal com Penas", quantity: "20", price: "209.99", animal: "Gato", category: "Brinquedos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/20037081000050-1.jpg", description:`O Arranhador 4 Estações Para Gatos Cone Sisal com Penas foi desenvolvido para proporcionar atividades físicas, evitando o stress preservando seus móveis. Um lugar adequado para arranhar, dormir e brincar. Tem um design bonito que pode situar-se em qualquer lugar da sua casa. Para evitar que o seu gato estrague móveis, paredes ou sofás, tenha a certeza de lhe proporcionar um lugar adequado para arranhar, assim poderá esticar-se, espreguiçar-se e afiar as suas unhas. Tamanho: 80cm. ` },
		{ name: "Brinquedo Chalesco Kit com 2 Ratinhos de Corda", quantity: "100", price: "20.99", animal: "Gato", category: "Brinquedos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/1457992630932.jpg", description:`- Indicado para gatos;
- Provoque seu gatinho para brincar com estes ratinhos que são pura diversão;
- Feitos de tecido de algodão, são ideais para seu melhor amigo que precisa diariamente de uma boa dose de entretenimento.` },
		{ name: "Brinquedo Jambo Gatos Joaninha Amarelo e Preto Vibratória", quantity: "50", price: "19.99", animal: "Gato", category: "Brinquedos", picture:"https://cdn-petz-imgs.stoom.com.br/fotos/1455921490800.jpg", description:`Presentear seu gatinho é uma forma divertida de descontrair o seu animal de estimação e evitar que eles mordam os móveis da sua casa. O Brinquedo Jambo Pet Gatos Joaninha Amarelo e Preto Vibratória é feito em poliéster e é perfeito para seu gatinho gastar as energias, pois vem com um dispositivo que vibra, deixando seu pet instigado durante longos períodos de tempo. ` }
		
    ];
    
    //inserção dos usuários no banco de dados
    for (let i in stockData) {
        objectStore.add(stockData[i]);
    }
}

//change hash
function changeHash(newHash){
    location.hash = newHash;
}

$(function(){

    $(window).on('hashchange', function(){

      let content = $("#content");

      switch(location.hash){
        case "":
          content.load("home.html");
          break;

        case "#about":
          content.load("about.html");
          break;

        case "#adm-admins":
          $("#adm-content").load("adm/admins.html");
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
          $("#adm-content").load("adm/users.html");
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
          $("#adm-content").load("adm/stock.html");
          break;

        case "#my-cart":
          content.load("my-cart.html");
          break;

        case "#my-profile":
          loadPageMyProfile();
          break;

        case "#login":
          content.load("login.html");
          break;

        case "#order-confirmation":
          content.load("order-confirmation.html");
          break;

        case "#products":
          content.load("products.html");
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

function loginClick() {
    if (userLoggedIn) {
        if (userSession.isAdmin)
            changeHash('adm-area');
        else
            changeHash('my-profile');
    } 
    else {
        changeHash('login');
    }
}

function loadPageMyProfile() {
    if(userLoggedIn){
        $("#content").load("my-profile.html", function() {
            $("#userName").text(userSession.name);
            $("#userCPF").text(userSession.cpf);
            $("#userAddress").text(userSession.address);
            $("#userEmail").text(userSession.email);
            $("#userTel").text(userSession.tel);
            $("#userPic").attr('src', userSession.profilePic);
        });
    }
    else{
        changeHash('login');
    }
}

function loadPageMyPet() {
    
    $(".main").html("");
    let userPets= [];
    
    let petCanvas = $('<div/>').addClass('foo');
    petCanvas.append($('<div id="photo"><img id="petPic" src="" width="300" height="auto"></div>'));
	
    let petInfo = ($('<div/>').addClass('MyAreaInfo'));
	petInfo.append($('<div><h4><b>Nome:</b> <span id="petName"></span></h4></div>'));
    petInfo.append($('<div><h4><b>Espécie:</b> <span id="petSpecies"></span></h4></div>'));
    petInfo.append($('<div><h4><b>Idade:</b> <span id="petAge"></span></h4></div>'));
    petInfo.append($('<div><h4><b>Sexo:</b> <span id="petGender"></span></h4></div>'));
    petInfo.append($('<div><h4><b>Raça:</b> <span id="petBreed"></span></h4></div>'));
    
    let i =0;
    let objectStore = db.transaction(["pets"], "readonly").objectStore("pets").index("owner");
    objectStore.openCursor(userSession.cpf).onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            let newCanvas = petCanvas.clone();
			dynamicId = cursor.value.name;
			let newInfo = petInfo.clone();
            userPets.push(cursor.value);
			console.log(dynamicId);
        
			newCanvas.attr('id', dynamicId);
            newCanvas.find("#petPic").attr('src', userPets[i].petPic);
            newInfo.find("#petName").text(userPets[i].name);
            newInfo.find("#petSpecies").text(userPets[i].species);
            newInfo.find("#petAge").text(userPets[i].age);
            newInfo.find("#petGender").text(userPets[i].gender);
            newInfo.find("#petBreed").text(userPets[i].breed);
            $(".main").append(newCanvas);
			$("#" + dynamicId).append(newInfo);
            i++;
            
            cursor.continue();
        }
    }
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
                        changeHash('my-profile');
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

function createAccount(){
    
    if($("#registerCPF").val().split(" ").join("") == "" || $("#registerName").val().split(" ").join("") == "" || $("#registerTel").val().split(" ").join("") == "" || $("#registerAddress").val().split(" ").join("") == "" || $("#registerEmail").val().split(" ").join("") == "" || $("#registerPassword").val().split(" ").join("") == "" || $("#registerConfirmPassword").val().split(" ").join("") == ""){
            alert("Preencha todos os campos!");
            return;
    }
    else{
        let newUser = { cpf: $.trim($("#registerCPF").val()), name: $.trim($("#registerName").val()), tel: $.trim($("#registerTel").val()), address: $.trim($("#registerAddress").val()), email: $.trim($("#registerEmail").val()), password: $("#registerPassword").val(), profilePic: $("#registerProfilePic").val(), isAdmin: false };
    
        if($("#registerConfirmPassword").val() == newUser.password){
            let objectStore = db.transaction(["users"], "readwrite").objectStore("users");
            objectStore.add(newUser);
            
            userLoggedIn = true;
            userSession.name = newUser.name;
            userSession.cpf = newUser.cpf;
            userSession.email = newUser.email;
            userSession.address = newUser.address;
            userSession.tel = newUser.tel;
            userSession.profilePic = newUser.profilePic;
            console.log(userSession.profilePic);					
            userSession.isAdmin = newUser.isAdmin;
            
            changePageMyProfile();
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
        changePageMyProfile();
    }
}