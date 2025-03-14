import axios from "axios";

//Variables de datos
var criptos: Record<string, { name: string; id: number; price:number }> = {};
var cantidad: number; //Cantidad total
var currency: string; //Divisa seleccionada
var criptomoneda: string; //Criptomoneda seleccionada
const {currencies} = require('./utils.ts');
var cripto_value: number; //Valor de la criptomoneda en USD
var result: number; //Resultado final

//Elementos del formulario
const btn_calcular:HTMLButtonElement = document.getElementById("calculate") as HTMLButtonElement;
const btn_inc:HTMLButtonElement = document.getElementById("btn_inc") as HTMLButtonElement;
const btn_dec:HTMLButtonElement = document.getElementById("btn_dec") as HTMLButtonElement;
const input_amount:HTMLInputElement = document.getElementById("cantidad") as HTMLInputElement;
const selectCripto:HTMLSelectElement = <HTMLSelectElement>document.getElementById("select-crypto");
const selectCurrency:HTMLSelectElement = <HTMLSelectElement>document.getElementById("select-currency");
const result_div: HTMLParagraphElement = document.getElementById("result") as HTMLParagraphElement;
//Cogemos los contenedores que queremos intercambiar (incluye img, nombre y select)
const selectCoin:HTMLElement = document.getElementById("select-coin") as HTMLElement;
const selectMoneda:HTMLElement = document.getElementById("select-moneda") as HTMLElement;
const intercambiar: HTMLElement = document.getElementById("change") as HTMLElement;


//---------------------------------------------------------------------


//Función para obtener la criptomoneda seleccionada
function obtenerCripto(event: Event){
    let selected_cripto = (event.target as HTMLSelectElement).value;
    let html_cripto_name = document.getElementById("crypto-name") as HTMLSpanElement;
    let html_cripto_img = document.getElementById("crypto-logo") as HTMLImageElement;

    //Actualizamos el nombre y la imagen del select
    html_cripto_name.innerText = criptos[selected_cripto].name;
    html_cripto_img.src = `https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/refs/heads/master/64/${criptos[selected_cripto].name.toLowerCase().replace(/\s+/g, "-")}.png`;
}

//Función para obtener la divisa seleccionada
async function obtenerDivisa(event: Event){
    let selected_currency = (event.target as HTMLSelectElement).value;
    let html_currency_name = document.getElementById("currency-name") as HTMLSpanElement;
    let html_country_img = document.getElementById("country-logo") as HTMLImageElement;

    //Actualizamos el nombre y la imagen del select
    let currency_names = await axios.get('https://v6.exchangerate-api.com/v6/cced7cb933f509ab441a2d98/codes');
    let currency_info = currency_names.data.supported_codes.find((currency: [string, string]) => currency[0] == selected_currency);
    html_currency_name.innerText = currency_info[1];

    html_country_img.src = `https://flagcdn.com/h60/${currencies[selected_currency]}.png`;
}

//Incrementamos el la cantidad
function incrementar(event:any){
    event.preventDefault();

    input_amount.value = (parseInt(input_amount.value) + 1).toString();
}

//Decrementamos la cantidad
function decrementar(event:any){
    event.preventDefault();

    if(parseInt(input_amount.value) > 1){ //Nunca será menor de 1
        input_amount.value = (parseInt(input_amount.value) - 1).toString();
    }
}

//Calculamos el resultado
async function calcularResultado(){
    cantidad = parseInt(input_amount.value);
    currency = selectCurrency.value;
    criptomoneda = selectCripto.value;

    console.log(`Cantidad: ${cantidad} Criptomoneda: ${criptomoneda} Divisa: ${currency}`);

    //Calcular el cambio de USD a la divisa seleccionada
    let cripto_value_usd = criptos[criptomoneda].price; 
    
    if(selectCoin.classList.contains('order-1')){ //La cantidad es de criptomonedas
        //Pasamos un USD a la divisa seleccionada
        let exchange_rate = (await axios.get(`https://v6.exchangerate-api.com/v6/cced7cb933f509ab441a2d98/pair/USD/${currency}`)).data.conversion_rate;
        result = (cantidad * cripto_value_usd) * exchange_rate; 
        result_div.innerText = `${cantidad} ${criptomoneda} = ${result.toFixed(2)} ${currency}`;

    } else if(selectMoneda.classList.contains('order-1')){ //La cantidad es de divisa
        //Pasamos un la divisa seleccionada a USD
        let exchange_rate = (await axios.get(`https://v6.exchangerate-api.com/v6/cced7cb933f509ab441a2d98/pair/${currency}/USD`)).data.conversion_rate;
        result = (cantidad * exchange_rate) / cripto_value_usd; 
        result_div.innerText = `${cantidad} ${currency} = ${result.toFixed(2)} ${criptomoneda}`;   
    }

    
}


//Funcion para intercambiar los selects
function intercambiarSelects(event: any) {
    event.preventDefault();

    console.log("Intercambiando selects");

    //Cambiar las clases para alterar el orden visual
    /* La propiedad toggle intercambia clases, es decir, sie stá la elimina y si no esta la crea*/
    selectCoin.classList.toggle('order-1');
    selectCoin.classList.toggle('order-3');
    
    

    selectMoneda.classList.toggle('order-1');
    selectMoneda.classList.toggle('order-3'); 
}

//Rellenamos los selects de forma automatica
async function obtenerDatos(): Promise<void> {
    //Llamamos a la API de cryptos para poder rellenar de forma automatica los selects
    try{
        let cripto_codes = await axios.get('https://api.coinlore.net/api/tickers/?limit=20');

        let criptos_data:[String] = cripto_codes.data.data;
        //Recorremos el array con reduce para construir un diccionario de criptos con symbol:nombre
        criptos = criptos_data.reduce((acumulador:any, cripto:any) => {
            acumulador[cripto.symbol] = {
                name: cripto.name,
                id: parseInt(cripto.id),
                price: parseFloat(cripto.price_usd)
            };

            return acumulador;
        
        }, {});

        console.log(criptos);

        //Rellenamos los selects
        for(let cripto_code in criptos){
            let option:HTMLOptionElement = document.createElement('option');
            option.value = cripto_code;
            option.textContent = cripto_code;
            selectCripto.appendChild(option);
        }        

        for(let currency_code in currencies){
            let option:HTMLOptionElement = document.createElement('option');
            option.value = currency_code;
            option.textContent = currency_code;
            selectCurrency.appendChild(option);
        }

        selectCripto.addEventListener('change', obtenerCripto);
        selectCurrency.addEventListener('change', obtenerDivisa);

    } catch(error){
        console.log("Error en la solicitud: ", error);
    };

    //Añadimos listeners
    btn_calcular.addEventListener('click', calcularResultado);
    btn_inc.addEventListener('click', incrementar);
    btn_dec.addEventListener('click', decrementar);
    intercambiar.addEventListener('click', intercambiarSelects);

    
}

document.addEventListener('DOMContentLoaded', obtenerDatos);