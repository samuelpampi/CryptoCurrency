import axios from "axios";

var criptos: { [key: string]: string } = {};
const {currencies} = require('./utils.ts');
const selectCripto:HTMLSelectElement = <HTMLSelectElement>document.getElementById("select-crypto");
const selectCurrency:HTMLSelectElement = <HTMLSelectElement>document.getElementById("select-currency");

//Función para obtener la criptomoneda seleccionada
function obtenerCripto(event: Event){
    let selected_cripto = (event.target as HTMLSelectElement).value;
    let html_cripto_name = document.getElementById("crypto-name") as HTMLSpanElement;
    html_cripto_name.innerText = criptos[selected_cripto];
    console.log(selected_cripto);
}

//Función para obtener la divisa seleccionada
async function obtenerDivisa(event: Event){
    let selected_currency = (event.target as HTMLSelectElement).value;
    let html_currency_name = document.getElementById("currency-name") as HTMLSpanElement;

    let currency_names = await axios.get('https://v6.exchangerate-api.com/v6/cced7cb933f509ab441a2d98/codes');
    let currency_info = currency_names.data.supported_codes.find((currency: [string, string]) => currency[0] == selected_currency);
    html_currency_name.innerText = currency_info[1];
    console.log(selected_currency);
}


//Rellenamos los selects de forma automatica
async function obtenerDatos(): Promise<void> {
    //Llamamos a la API de cryptos para poder rellenar de forma automatica los selects
    try{
        let cripto_codes = await axios.get('https://api.coinlore.net/api/tickers/?limit=30');

        let criptos_data:[String] = cripto_codes.data.data;
        //Recorremos el array con reduce para construir un diccionario de criptos con symbol:nombre
        criptos = criptos_data.reduce((acumulador:Record<string,string>, cripto:any) => {
            acumulador[cripto.symbol] = cripto.name;
            return acumulador;
        }, {});
        
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
    
}

document.addEventListener('DOMContentLoaded', obtenerDatos);