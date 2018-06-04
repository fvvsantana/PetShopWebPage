//Inicio da organização do IndexedDB
let db;

//Inicialmente não há um usuário logado
let userLoggedIn = 0;

//Dados do usuário que estiver em uma sessão estarão aqui
let userSession = {name: "", cpf: "", email: "", address: "", tel:"", profilePic: "", isAdmin: 0};

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
    addPets(petStore);
};

// adiciona usuários de exemplo
function addUsers(objectStore){
    
    //dados dos usuários iniciais
    const userData = [
        { cpf: "admin", name: "Bill", tel: "123", address: "Rua 1", email: "bill@mypet.com", password: "admin", profilePic:"http://meganandtimmy.com/wp-content/uploads/2012/09/4ce4a17fb7f35-447x600.jpg", isAdmin: 1 },
        { cpf: "321", name: "Jubileu", tel: "321", address: "Rua 3", email: "jubileu@gmail.com", password: "321", profilePic:"https://pbs.twimg.com/media/C3BxfpmWIAAGJpw.jpg", isAdmin: 0 }
    ];
    
    //inserção dos usuários no banco de dados
    for (let i in userData) {
        console.log("adicionando");
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

function changePageMyPet() {
    
    $(".main").html("");
    let userPets= [];
    
    let petCanvas = $('<div/>').addClass('foo');
    petCanvas.append($('<div id="photo"><img id="petPic" src="" width="300" height="auto"></div>'));
    petCanvas.append($('<div><h4>Nome:</h4><span id="petName"></span></div>'));
    petCanvas.append($('<div><h4>Espécie:</h4><span id="petSpecies"></span></div>'));
    petCanvas.append($('<div><h4>Idade:</h4><span id="petAge"></span></div>'));
    petCanvas.append($('<div><h4>Sexo:</h4><span id="petGender"></span></div>'));
    petCanvas.append($('<div><h4>Raça:</h4><span id="petBreed"></span></div>'));
    
    let i =0;
    let objectStore = db.transaction(["pets"], "readonly").objectStore("pets");
    objectStore.openCursor().onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            if(cursor.value.owner == userSession.cpf){
                let newCanvas = petCanvas.clone();
                console.log(cursor.value.name);
                userPets.push(cursor.value);					
                console.log(i);
            
                newCanvas.find("#petPic").attr('src', userPets[i].petPic);
                newCanvas.find("#petName").text(userPets[i].name);
                newCanvas.find("#petSpecies").text(userPets[i].species);
                newCanvas.find("#petAge").text(userPets[i].age);
                newCanvas.find("#petGender").text(userPets[i].gender);
                newCanvas.find("#petBreed").text(userPets[i].breed);
                $(".main").append(newCanvas);
                i++;
            }
            cursor.continue();
        }
        

    
    }
        
        
        for(i = 0; i < userPets.length; i++){

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
