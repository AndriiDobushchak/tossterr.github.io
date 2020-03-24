console.log("Hi!"); 

    let ballistic = {}
    let conditions = {}
    let shooter = {}

    // кемел кейс - функції . через підкреслення - результати

document.getElementById("about").onclick = ()=> 
    alert(`    Ця веб-аплікація призначена для обчислення шансу 
        влучити у ціль.
        Прийняті наступні допущення: 
            - стрільба ведеться з гвинтівки по круглій цілі. 
            - математична модель - частково реалістична. 
            - accuracy на 100м при 'ідеальних умовах'. 
            - МОА, minute of angle на 100м = 29мм
        Додаток знаходиться на стадії тестування.
        Робота перевірена з балістикою 308win 175gr 790м/с`);
        

// onclick "save"
document.body.children[1].children[3].onclick = function () {
    alert(document.body.children[1].children[0].value + " data saved to local storage");
    chancemap = [document.body.children[1].children[0].value, JSON.stringify(ballistic), JSON.stringify(conditions), JSON.stringify(shooter)];
    localStorage.setItem("chancemap",chancemap);
}

//  onclick "load"
document.body.children[1].children[2].onclick = function () {
    alert("Only available in extended version.");
}

// onchange "caliber"
document.getElementById("caliber").onchange = function () {
    if (document.getElementById("caliber").value == 1) {
        document.getElementById("223_1").removeAttribute("disabled");
        document.getElementById("223_2").removeAttribute("disabled");
        document.getElementById("308_1").setAttribute("disabled", "disabled");
        document.getElementById("308_2").setAttribute("disabled", "disabled");
        document.getElementById("338_1").setAttribute("disabled", "disabled");
        document.getElementById("338_2").setAttribute("disabled", "disabled");
    }
    if (document.getElementById("caliber").value == 2) {
        document.getElementById("223_1").setAttribute("disabled", "disabled");
        document.getElementById("223_2").setAttribute("disabled", "disabled");
        document.getElementById("308_1").removeAttribute("disabled");
        document.getElementById("308_2").removeAttribute("disabled");
        document.getElementById("338_1").setAttribute("disabled", "disabled");
        document.getElementById("338_2").setAttribute("disabled", "disabled");
    }
    if (document.getElementById("caliber").value == 3) {
        document.getElementById("223_1").setAttribute("disabled", "disabled");
        document.getElementById("223_2").setAttribute("disabled", "disabled");
        document.getElementById("308_1").setAttribute("disabled", "disabled");
        document.getElementById("308_2").setAttribute("disabled", "disabled");
        document.getElementById("338_1").removeAttribute("disabled");
        document.getElementById("338_2").removeAttribute("disabled");
    }
}
// onclick "evalute"
document.getElementById("shot").onclick = function () {
    ballistic = {
            muzzle_velocity : document.getElementById("velocity").value,
            caliber : document.getElementById("caliber").value,
            bullet_weight : document.getElementById("bullet_weight").value,
            accuracy_100 : document.getElementById("accuraty_100").value
    }
    conditions = {
            wind_speed : document.getElementById("wind_speed").value,
            wind_direction : document.getElementById("wind_direction").value,
            range : document.getElementById("range").value,
            target : document.getElementById("target").value
    }
    shooter = {
            position : document.getElementById("position").value,
            skill : document.getElementById("skill").value,
            range_error : document.getElementById("range_error").value,
            wind_speed_error : document.getElementById("wind_speed_error").value
    }
    
    // встановлюємо коефіцієнти дроп-функції згідно маси
    kd1 = JSON.parse(document.getElementById("bullet_weight").value)[0];
    kd2 = JSON.parse(document.getElementById("bullet_weight").value)[1];
    kd3 = JSON.parse(document.getElementById("bullet_weight").value)[2];
    // встановлюємо коефіцієнти дріфт-функції згідно маси
    kw1 = JSON.parse(document.getElementById("bullet_weight").value)[3];
    kw2 = JSON.parse(document.getElementById("bullet_weight").value)[4];
    kw3 = JSON.parse(document.getElementById("bullet_weight").value)[5];

        drift(conditions.range);    
        accuracyEffective();
        deltaDrop();   
        drift(conditions.range);   
        ch_0(conditions.target, accuracy_eff);
        chanceOfHit();
        chart(); 
        drift(conditions.range);    
        accuracyEffective();
        deltaDrop();   
        drift(conditions.range);   
        ch_0(conditions.target, accuracy_eff);
        chanceOfHit();
}

// Ballistic block
   
    function drop(range){   //функція визначення дропу в залежності від відстані y=x^3*k1+x*k2-k3
        // kd1, kd2, kd3 - це коефіцієнти форми дроп-фунції
        // let kd1 = 0.0000014 + (790 - (+ballistic.muzzle_velocity))/100000000; // kd1 = 0.0000014 для .308 790 м/с
        // let kd2 = 0.18;
        // let kd3 = -10;
        _drop = (range**3)*kd1 + range*kd2 + kd3;
       
        return _drop;
    }
        
    // kw1 - це коефіцієнти форми дріфт-фунції
        // let kw1 = 0.000045;
        // let kw2 = 0;
        // let kw3 = 0;

    function drift(range){ //функція визначення дріфту в залежності від вітру y=x^2*kw1    _drift = (range**2)*kw1 * w_value   
        // розрахунок діючого(ефективног) значення вітру
        w_direct = Math.abs(Math.sin(conditions.wind_direction*0.0175)); // коефіцієнт напрямку вітру. Переводим градуси в радіани
        w_value = w_direct * conditions.wind_speed;                        // діюче значення вітру без похибки
        w_value_error = w_direct * (+conditions.wind_speed+(+shooter.wind_speed_error)); // діюче значення вітру з похибкою 
        _drift = (range**2)*kw1 + range*kw2 + kw3; // дріфт формула
        delta_drift = _drift * w_value_error - _drift * w_value;  
        return delta_drift;
    }
                       
// Conditions block
    
    function ch_0 (target, accuracy){ // функція визначення шансу попадання без жодних похибок 
        let chance_ideal = parseInt((target**2 / accuracy**2)*100);
        if (chance_ideal >= 100) {chance_ideal = 99}
        let tmp = document.getElementById("chance_ideal");
        if (isNaN(chance_ideal)){       // відсікаємо некоректний результат(через неправильні вхідні дані)
            //alert("Incorrect data !");    
        }
        else {
            tmp.innerHTML = parseInt(chance_ideal) + "%"; //виводимо значення
            // Додаємо колір в залежності від результату
            if ( chance_ideal < 40 ){ 
                tmp.style.color = "rgb(255,0,0)";}
            if ((chance_ideal >= 40 )&&( chance_ideal < 60)){
                tmp.style.color = "rgb(255,255,0)";}
            if ((chance_ideal >= 60 )&&( chance_ideal < 90 )){
                tmp.style.color = "rgb(162,255,162)";}
            if ( chance_ideal >= 90 ){
                tmp.style.color = "rgb(0,182,0)";}
        }
        return chance_ideal; 
   }

// Shooter block
    function accuracyEffective (){ // ефективна(діюча) accr
        accuracy_range = ballistic.accuracy_100 * conditions.range * 2.9 / 100;   // також переводимо МОА в см. 1 МОА на 100 м = 2.9 см
        accuracy_eff = accuracy_range * shooter.skill * shooter.position; //accr з урахуванням скіла і позиції
        return accuracy_eff;
    }

    function deltaDrop (){    // різниця у дропі на ренджі і на макс похибці по ренджу
        delta_drop = drop(conditions.range) - drop(conditions.range-shooter.range_error)
    }
      
    function chanceOfHit () {
        chance_true = 0;
        //рознахуно шансу по дропу (без переведення у %)
        let diagonal_drop = accuracy_eff/2 - delta_drop + conditions.target/2; // діагональ "спільної" площі
        if (diagonal_drop >= accuracy_eff) {diagonal_drop = accuracy_eff;} // шанс по дропу = 100%
        if (diagonal_drop <= 0) {diagonal_drop = 0;} // шанс по дропу = 0%
        let chance_drop = diagonal_drop**2 / accuracy_eff**2;

        //розрахунок шансу по дріфту (без переведення у %)
        let diagonal_drift = accuracy_eff/2 - delta_drift + conditions.target/2
        if (diagonal_drift >= accuracy_eff) {diagonal_drift = accuracy_eff;} // шанс по дріфту = 100%
        if (diagonal_drift <= 0) {diagonal_drift = 0;} // шанс по дріфту = 0%
        let chance_drift = diagonal_drift**2 / accuracy_eff**2;

        // ШАНС = шанс по дропу * шанс по дріфту * 100%
        chance_true = parseInt(chance_drop * chance_drift * 100);
        if (chance_true >= 100) {chance_true = 99}
        let tmp = document.getElementById("chance_true");
        if (isNaN(chance_true)) {
            alert("Incorrect data !");      
        }
        else{
            tmp.innerHTML = parseInt(chance_true) + "%"; //виводимо значення  
            // Додаємо колір в залежності від результату
            if ( chance_true < 40 ){ 
                tmp.style.color = "rgb(255,0,0)";}
            if ((chance_true >= 40 )&&( chance_true < 60)){
                tmp.style.color = "rgb(255,255,0)";}
            if ((chance_true >= 60 )&&( chance_true < 90 )){
                tmp.style.color = "rgb(162,255,162)";}
            if ( chance_true >= 90 ){
                tmp.style.color = "rgb(0,182,0)";} 
        }       
        return chance_true;      
    }
    
    function chart(){     //кольорова діаграма
        let chart_chance = chance_true; // ловимо шанс=)
        let chart_rang = conditions.range; // ловимо зачення введене користувачем
        let width_95 = 0; // ширина відповідного кольорового блоку діаграми 
        let width_75 = 0; // дефолтні значення
        let width_55 = 0;
        let width_35 = 0;
        let tmpChart = "";
        
        //цикл визначення шансу для кожно метра дистанції від 100 до 900
        if (!isNaN(chance_true)){   // при некоректних даних діаграма не виводиться
            for (i=100; i<=898; i++){
                conditions.range = i;  

                drift(conditions.range);
                accuracyEffective();
                deltaDrop();
                drift(conditions.range);
                ch_0(conditions.target, accuracy_eff);
                chanceOfHit();
                    
                if ( chance_true >= 90 ){
                    width_95 = ++width_95;       }
                if ((chance_true >= 60 )&&( chance_true < 90 )){
                    width_75 = ++width_75;} 
                if ((chance_true >= 40 )&&( chance_true < 60)){
                    width_55 = ++width_55;}        
                if ( chance_true < 40 ){     
                width_35 = ++width_35;}
            }
        }
        // встановлюємо ширину(довжину) відповідного кольору
        tmpChart = "background-color: rgb(0,182,0); width: " + width_95 + "px;";
        document.getElementById("95").setAttribute("style",tmpChart);          
        
        tmpChart = "background-color: rgb(162,255,162); width: " + width_75 + "px;";
        document.getElementById("75").setAttribute("style",tmpChart);

        tmpChart = "background-color: rgb(255,255,0); width: " + width_55 + "px;";
        document.getElementById("55").setAttribute("style",tmpChart);
           
        tmpChart = "background-color: rgb(252,0,0); width: " + width_35 + "px;";
        document.getElementById("35").setAttribute("style",tmpChart);
        
        conditions.range = chart_rang; // повертаємо значення введене користувачем
        chance_true = chart_chance;
        return;
    }