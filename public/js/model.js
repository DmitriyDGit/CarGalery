(function(){

    var ItemsModel = function() {
     
        this.testApi =  function () {
            $.get("/testApi", function( data ) {
                console.log("API is working...");
                console.log(data);
            })
        }
        
       this.getDataPromise = function() {
            return $.get("data/list.json", function(data) {
                return data;
            })            
        }
        
        this.getGalleryItemByName = function (name) {
            return $.get("/getGalleryItemByName", name);            
        }
        
       this.getJsonData = function () {
            $.get("/getGalleryList", function( data ) {
                console.log("Default load");
                console.log(data);
            })            
        }
        
        this.saveData = function (data) {
            return $.post('/saveGalleryItem', data);
        }

        this.DOMElements = null;
        this.serverData =[];//nj что пришло с сервера
        this.bufferArray = [];//массив который отображает галерею (нужен для переключения способа отображения, сортировки и тд)
        this.mappedArray = []; //массив с отформтированными данными с сервера.
        this.tempArray = [];// массив в которов хранятся удаленные элементы
        this.i = 0;
        this.sortFieldValue = 0;
        this.outputCode = 0;
        this.counter = 0;
        this.elem;

        this.makeNewArr = function(data) {
            var newArr = [];
            data.forEach(function(item, index){
                newArr.push(
                    {
                        name: item.name,
                        url: item.url,
                        params: {
                            status: item.popular,
                            progress: item.progress||"",
                            },
                        description :  item.description,
                        date : item.date,
                        id:item.id
                    }
                )
            })
            return newArr;
        }

        this.newUrl = function (url){
            return url.indexOf("http://") == -1 ? "http://" + url :  url; 
        }
        this.nameFormat = function (name){
            return  name[0].toUpperCase() + name.substring(1).toLowerCase();
        }
        this.newDescr =function (descr){
            return   descr.length > 15 ? descr.substring(0,15) + "..." : descr;
        }
        this.newData = function (data){
            return  moment(data).format('YYYY/MMMM/DD h:mm');
        }
       this.newParams = function (par){
            return  par.status + ">=" + par.progress;
        }
      this.mapTheArray =  function (arr){ 
             return arr.map(function(item, index){
                return {
                    url: this.newUrl(item.url)||"",
                    name: this.nameFormat(item.name)||"",
                    description: this.newDescr(item.description)||"",
                    date: this.newData(item.date)||"",
                    params: {
                            status: item.params.status||"",
                            progress: item.progress||"",
                            },
                    isVisible: item.params.status||"",
                    id: index
                    };
            }.bind(this));
        }

        this.prepareInputDataToAdd = function (arr) {
            arr.push({
                url: this.newUrl(this.DOMElements.url.value),
                name:this.DOMElements.name ? this.nameFormat(this.DOMElements.name.value):" ",
                id:this.counter,
                params:{
                    status: this.DOMElements.populary ? this.DOMElements.populary.value:" ", 
                    progress: this.DOMElements.progress ? this.DOMElements.progress.value:" "
                    },
                description: this.DOMElements.description ? this.DOMElements.description.value:" ",
                date:this.DOMElements.date ?this.newData(this.DOMElements.date.value):" "
            });
        }
        //.........................form block......................
             
        this.showHide = function (elem, status){
            elem.style.display = status;
        }
        this.showForm = function () {
            this.showHide(this.DOMElements.form, "block");
        }
        this.hideErrorMassages = function() {
            this.showHide(this.DOMElements.errorMsg, "none");
            this.showHide(this.DOMElements.wrongUrlMsg, "none");
            this.showHide(this.DOMElements.wrongFillMsg, "none");
        }
        this.clearFields = function  (){
            this.hideErrorMassages.bind(this);
            //this.showHide(this.DOMElements.form, "none");
            //this.showHide(this.DOMElements.table, "none");
            //this.showHide(this.DOMElements.successMsg, "none");
            this.DOMElements.url.value = "";
            this.DOMElements.name.value  = "";
            this.DOMElements.description.value = "";
            this.DOMElements.populary.value = "";
            this.DOMElements.progress.value = "";
            this.DOMElements.date.value = "";
            this.DOMElements.filter.value = "";
            event.preventDefault();
        }
        this.saveNewCar = function(newCarData) {
            $.post('/saveGalleryItem', newCarData)
            .done(function() {
                console.log('Data successfuly saved:');
                console.log(newCarData);
            })
            .fail(function(){
                console.log('the new car`s data failed to send');
            });
        }
        this.validate = function  (event) {
                if(this.DOMElements.url.value
                    && this.DOMElements.name.value
                    && this.DOMElements.description.value
                    && this.DOMElements.date.value
                 ) {         
                    this.prepareInputDataToAdd(this.mappedArray);
                    this.addToGalery(this.mappedArray[this.mappedArray.length-1]);
                   // this.bufferArray.push(this.data[0]);
                    this.hideErrorMassages.bind(this);
                    this.showHide(this.DOMElements.form, "none");
                    this.saveNewCar(this.mappedArray[this.mappedArray.length-1]);
                    this.counter++;
                    this.DOMElements.count.innerHTML = this.counter;
                   // this.data.shift();
                } else {
                    this.showHide(this.DOMElements.errorMsg, "block");
                }
            event.preventDefault();
        }

     // end form block                                               

        this.addToGalery = function  (item) { // можно добавить ${item.params.progress}
            var itemTemplateBlock = `<div id="${item.id}" class = "col-sm-4 col-xs-4 slide">\
                        <img src="${item.url}" alt="${item.name}" class="img-thumbnail">\
                        <div class="info-wrapper">\
                            <div class="text-muted"><strong>${item.name}</strong></div>\
                            <div class="text-muted">${item.description}</div>\
                            <div class="text-muted"></div>\
                            <div class="text-muted">${item.date}</div>\
                        </div>\
                        <button class="btn btn-default" type="button" id="delete"   data-toggle="tooltip" data-placement="left" title="" data-original-title="Удалить одно изображение">Удалить</button>
                    </div>`;
            var itemTemplateInline = `<div id="${item.id}" class = "col-sm-12 col-xs-12 slide-inline slide">\
                        <img src="${item.url}" alt="${item.name}" class="img-thumbnail">\
                        <div class="info-wrapper">\
                            <div class="text-muted"><strong>${item.name}</strong></div>\
                            <div class="text-muted">${item.description}</div>\
                            <div class="text-muted"></div>\
                            <div class="text-muted">${item.date}</div>\
                        </div>\
                        <button class="btn btn-default" type="button" id="delete"  data-toggle="tooltip" data-placement="left" title="" data-original-title="Удалить одно изображение">Удалить</button>
                    </div>`;
            this.DOMElements.resultBlock.innerHTML += this.outputCode == 0 ? itemTemplateBlock : itemTemplateInline;
        }

        this.toggleOutputViewBlock =  function () {
            var slide = document.querySelectorAll('.slide');
            this.outputCode = 0;
            for (var g = 0; g < slide.length; g++ ) {
                slide[g].classList.remove("col-sm-12", "col-xs-12", "slide-inline");
                slide[g].classList.add("col-sm-4", "col-xs-4");
            }
        }

        this.toggleOutputViewInline =  function () {
            var slide = document.querySelectorAll('.slide');
            this.outputCode = 1;
            for (var g = 0; g < slide.length; g++ ) {
                slide[g].classList.remove("col-sm-4", "col-xs-4");
                slide[g].classList.add("col-sm-12", "col-xs-12", "slide-inline");
            }
        }


        this.findElem =   function (array,ElemId) {
          for (var j = 0; j < array.length; j++) { 
            if (array[j].id == ElemId) {
                return j;     
            } 
        }}

        this.clearFields = function  (){
           this.DOMElements.addImage.removeAttribute("disabled"); 
           this.DOMElements.resultBlock.innerHTML = "";
        }
        this.clearBufferArray =  function  (){
            this.bufferArray = [];
        }
        this.resetCounter =  function  () {
            this.counter = 0;
            this.DOMElements.count.innerHTML = this.counter;
        }
        this.resetAllFields =  function  () {
            this.clearFields();
            this.clearBufferArray();
            this.resetCounter();
        }

        this.deleteOneImage =  function  (el) {
            if (event.target.tagName == "BUTTON") {
                var el = el;
                this.DOMElements.resultBlock.removeChild(event.target.parentNode);
                this.counter--;
                this.DOMElements.count.innerHTML = this.counter;
                this.DOMElements.addImage.removeAttribute("disabled");
                this.tempArray.push(event.target.parentNode.id);
                this.bufferArray.splice(this.findElem(this.bufferArray,event.target.parentNode.id),1);
                //bufferArray.splice(findElem(bufferArray,el.parentNode.id.id), 1);
            }
        }

        this.findSortFieldValue =  function (event) {
           this.sortFieldValue = event.target.value; 
        }

        this.sort =   function  () {
            switch ( this.sortFieldValue) {
                    case "1" :
                     this.clearFields(); 
                    this.bufferArray.sort( this.compareA_Z);
                     this.bufferArray.forEach(function (item){
                         this.addToGalery (item);
                    }.bind(this))
                    break;
                    case "2" :
                     this.clearFields(); 
                     this.bufferArray.sort( this.compareZ_A);
                     this.bufferArray.forEach(function (item){
                         this.addToGalery (item);
                    }.bind(this))
                    break;
                    case "3" :
                     this.clearFields(); 
                     this.bufferArray.sort( this.compareNew_Old);
                     this.bufferArray.forEach(function (item){
                         this.addToGalery (item);
                    }.bind(this))
                    break;
                    case "4" :
                     this.clearFields(); 
                     this.bufferArray.sort( this.compareOld_New);
                     this.bufferArray.forEach(function (item){
                         this.addToGalery (item);
                    }.bind(this))
                    break;
            }
        }

        this.compareA_Z = function (a, b) {    
            return (a.name < b.name) ? -1 : (a.name > b.name) ? +1 : 0;
        }
       this.compareZ_A =   function (a, b) {    
            return (a.name < b.name) ? +1 : (a.name > b.name) ? -1 : 0; 
        }
       this.compareNew_Old =  function (a, b) {    
            return Date.parse(a.date) < Date.parse(b.date) ? 1 : -1;
        }
        this.compareOld_New = function (a, b) {    
            return Date.parse(a.date) > Date.parse(b.date) ? 1 : -1;
        }

        this.init =  function () {
            this.showHide(this.DOMElements.form, "none");
            this.mappedArray = this.mapTheArray(this.makeNewArr(this.serverData));
          //  if (this.counter < this.mappedArray.length  ) {
                if(this.tempArray.length == 0){
                    this.addToGalery(this.mappedArray[this.counter]);
                    this.bufferArray.push(this.mappedArray[this.counter]);
                    this.counter++;
                }
                if(this.tempArray.length !==0 ){
                    this.addToGalery(this.mappedArray[this.tempArray[0]]);
                    this.bufferArray.push(this.mappedArray[this.tempArray[0]]);
                    this.counter++;
                    this.tempArray.shift();
                } 
          //  } 
           // if (this.counter  ===  this.mappedArray.length ) {
            //    this.DOMElements.addImage.setAttribute("disabled", true);
           // }
            this.DOMElements.count.innerHTML = this.counter;
            this.sort();
        } 

        this.search =  function (event) {
            this.input = this.DOMElements.filter.value;
            if (this.input.length = 3) {
                this.getGalleryItemByName({name: this.input})
                .done(function(data) {
                        console.log("Filtered Items is loaded for query \'%s\'", this.input);
                        console.log(data);
                        this.elem = data;
                        console.log(this.elem);
                        this.addToGalery( this.mapTheArray(this.makeNewArr(this.elem)));
                    })
                .fail(function () {
                        console.log("Filtered Items was not found");
                })
            }
        }

        this.addSearchedElem = function(){
            console.log(this.elem);
            this.addToGalery( this.mapTheArray(this.makeNewArr(this.elem)));
        }


        this.initListeners = function () {
            this.DOMElements.addImage.addEventListener("click", this.init.bind(this));
            this.DOMElements.clearGallery.addEventListener("click", this.resetAllFields.bind(this));
            this.DOMElements.sortFieldBtn.addEventListener("change", this.findSortFieldValue.bind(this));
            this.DOMElements.sortFieldBtn.addEventListener("change", this.sort.bind(this));
            this.DOMElements.outputBlockBtn.addEventListener("click", this.toggleOutputViewBlock.bind(this));
            this.DOMElements.outputInlineBtn.addEventListener("click", this.toggleOutputViewInline.bind(this));
            this.DOMElements.resultBlock.addEventListener("click", this.deleteOneImage.bind(this));
            //this.DOMElements.filter.addEventListener("keyup", this.search.bind(this));
           // this.DOMElements.filterBtn.addEventListener("click", this.addSearchedElem.bind(this));
            this.DOMElements.saveBtn.addEventListener("click", this.validate.bind(this)); 
            this.DOMElements.addNewBtn.addEventListener("click", this.showForm.bind(this)); 
            this.DOMElements.refreshBtn.addEventListener("click", this.clearFields.bind(this));   
            this.DOMElements.formFields.addEventListener("focus", this.hideErrorMassages.bind(this));  
        }

        this.printResult = function (){
        // console.log(this.newUrl("google.com"));
         //   console.log("hehehe");
        }
        this.setFormData = function (form){ 
                this.DOMElements = form;
        }
        this.initValidator = function (form){
            this.initListeners();
        }
    }
    
    var model = new ItemsModel();
    
     model.setFormData({
        addImage:document.querySelector("#add"),
        deleteImage:document.querySelector("#delete"),
        clearGallery: document.querySelector("#clear"),
        resultBlock: document.querySelector('#result'),
        count: document.querySelector("#count"),
        sortFieldBtn: document.querySelector('#sortField'),
        outputBlockBtn: document.querySelector("#output-block"),
        outputInlineBtn: document.querySelector("#output-inline"),
        slide: document.querySelectorAll('.slide'),
        filterBtn: document.querySelector("#filterBtn"),
        filter: document.querySelector("#filter"),

        addFromBaseBtn:document.querySelector("#add-from-base"),
        url: document.querySelector("#inputUrl"),
        name: document.querySelector("#inputName"),
        description   : document.querySelector("#inputDescription"),
        populary : document.querySelector("#inputPopulary"),
        progress: document.querySelector("#inputProgress"),
        date: document.querySelector("#inputDate"),
        saveBtn : document.querySelector("#saveBtn"),
        refreshBtn: document.querySelector("#refreshBtn"),
        addNewBtn:document.querySelector("#add-new"),
        submitBtn: document.querySelector("#submit"),
        resetBtn: document.querySelector("#reset"),
        clearBtn:document.querySelector("#clear-galery"),
        deleteBtn:document.querySelector("#delete"),
        sortFieldBtn:document.querySelector("#sortField"),
        errorMsg: document.querySelector(".bg-danger"),
        successMsg: document.querySelector(".bg-success"),
        wrongUrlMsg: document.querySelector(".wrong-url"),
        wrongFillMsg: document.querySelector(".wrong-fill"),
        form: document.querySelector(".form-horizontal"),
        formFields: document.querySelector(".form-control"),
        resultBlock: document.querySelector("#result"),
        slideCounter: document.querySelector("#count"),
        outputBlockBtn:document.querySelector("#output-block"),
        outputInlineBtn:document.querySelector("#output-inline")
    })

    model.initValidator();

    // проверяем работоспособность API
    model.testApi();
    model.printResult();
    
    // получить данные из json файла который лежит на диске
    model.getJsonData();
    
    // Получить все данные из бызы данных. 
    // Передать полученные данные в callback функцию
    model.getDataPromise().then(function(data){
        console.log("All data is loaded");
        console.log(data);
        model.serverData = data;
        console.log(model.serverData);
    });
    
    // Получить те елементы из бызы данных,
    // в поле имя которых, входят буквы указанные в параметре name
    var filter ="BMW";
    model.getGalleryItemByName({name: filter}).then(function(data){
        console.log("Filtered Items is loaded for query \'%s\'", filter);
        console.log(data);
    });
    
    // Сохранить данные на сервер
    model.saveData({name: "test", url: "http://testing.com"})
        .done(function(galleryItem) {
		  console.log('Item successfuly saved');
		  console.log(galleryItem);
        });
}())



