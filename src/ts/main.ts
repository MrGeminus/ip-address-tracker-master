// Importing libraries and interfaces

import * as L from 'leaflet';
import axios, { AxiosResponse } from 'axios';
import { IpifyDetailedResponse, IpifySimpleResponse } from './interfaces';

// Selecting necessary elements from the DOM and storing them in variables

const searchForm = document.querySelector('[data-search-form]') as HTMLFormElement;
const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
const searchButton = document.querySelector('[data-search-button]') as HTMLButtonElement;
const errorMessage = document.querySelector('[data-error-message]') as HTMLParagraphElement;
const ipOutput = document.querySelector('[data-item-value=ipAddress]') as HTMLDListElement;
const locationOutput = document.querySelector('[data-item-value=location]') as HTMLDListElement;
const timezoneOutput = document.querySelector('[data-item-value=timezone]') as HTMLDListElement;
const ispOutput = document.querySelector('[data-item-value=isp]') as HTMLDListElement;

// Initializing the map

const map = L.map('map', { center: [0, 0], zoom: 4, zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, tap: false, touchZoom: false, keyboard: false });

// Modifying marker icon options

const locationIcon = L.icon({
    iconUrl: (new URL('../assets/img/icon-location.svg', import.meta.url)).toString(),
    iconSize: [35, 45],
    iconAnchor: [25, 16]
});

// Creating the marker



// Instantiating tile layer

const mapTiles = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});

// Adding the map tile layer to the map

mapTiles.addTo(map);

// Function that displays the gotten data on the page

const displaySearchResults = (data: IpifyDetailedResponse): void => {
    // Using the flyTo method to animate to the targeted location
    map.flyTo([data.location.lat, data.location.lng], 16);
    // Changing the marker position to the new location and adding it to the map
    const mapMarker = L.marker([data.location.lat, data.location.lng], { icon: locationIcon, alt: `${data.location.city}, ${data.location.country}` });
    mapMarker.addTo(map);
    // Changing the text content of the dd elements in the description list
    ipOutput.textContent = data.ip;
    locationOutput.textContent = `${data.location.city}, ${data.location.country} ${data.location.postalCode}`;
    timezoneOutput.textContent = `UTC ${data.location.timezone}`;
    ispOutput.textContent = data.isp;
}

// Function that talks to Netlify serverless function to get information about the user's public IP address

const getPublicIPInformation = async (query: string): Promise<void> => {
    try {
        const { data }: AxiosResponse<IpifyDetailedResponse> = await axios(`/.netlify/functions/ipify?query=${query}`);
        console.log(data);
        displaySearchResults(data);
    }
    catch (error) {
        console.log(error);
    }
};

// Function that adds invalid styling to form elements and injects the error message

const addInvalidStyling = (errorText: string): void => {
    searchInput.classList.add('search-form__input--is-invalid');
    errorMessage.classList.remove('search-form__error-message--is-hidden');
    errorMessage.classList.add('search-form__error-message--is-visible');
    errorMessage.textContent = errorText;
    searchInput.setAttribute('aria-invalid', 'true');
    errorMessage.setAttribute('aria-live', 'assertive');
    searchButton.setAttribute('disabled', 'true');
}

// Function that removes invalid styling from form elements and deletes the error message

const removeInvalidStyling = () => {
    errorMessage.textContent = '';
    searchInput.classList.remove('search-form__input--is-invalid');
    errorMessage.classList.remove('search-form__error-message--is-visible');
    errorMessage.classList.add('search-form__error-message--is-hidden');
    searchInput.setAttribute('aria-invalid', 'false');
    errorMessage.setAttribute('aria-live', 'off');
    searchButton.removeAttribute('disabled');
}

// Function to handle the form submission

const handleFormSubmission = async (e: Event): Promise<void> => {
    // Preventing the default behavior of the form
    e.preventDefault();
    // Getting the value of the input field
    const searchInputValue = searchInput.value.trim();
    // Checking if the value is a valid IP address or domain name
    if (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(searchInputValue)) {
        await getPublicIPInformation(`ipAddress=${searchInputValue}`);
    }
    else if (/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(searchInputValue)) {
        await getPublicIPInformation(`domain=${searchInputValue}`);
    }
    else {
        addInvalidStyling('Please enter a valid IP address or domain');
    }
}

// Function that gets the user's public IP address

const getUserPublicIp = async (): Promise<void> => {
    try {
        const { data }: AxiosResponse<IpifySimpleResponse> = await axios('https://api.ipify.org/?format=json');
        await getPublicIPInformation(`ipAddress=${data.ip}`)
    }
    catch (error) {
        searchInput.setAttribute('disabled', 'true');
        searchButton.setAttribute('disabled', 'true');
        alert('Please disable adblocker and try again!');
    }
}

// Listening for the submit event on the search form

searchForm.addEventListener('submit', (e: Event) => handleFormSubmission(e));

// Listening for the key press event on the search input

searchInput.addEventListener('keydown', () => removeInvalidStyling());

// On the initial page load get user's public IP address to show his location on the map

document.addEventListener('DOMContentLoaded', () => getUserPublicIp());

