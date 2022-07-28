// Importing libraries and interfaces
import * as L from 'leaflet';
import axios, { AxiosResponse } from 'axios';
import { IpifyDetailedResponse, IpifySimpleResponse } from './interfaces';

// Selecting necessary elements from the DOM
const searchForm = document.querySelector('[data-search-form]') as HTMLFormElement;
const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
const errorMessage = document.querySelector('[data-error-message]') as HTMLParagraphElement;
const ipOutput = document.querySelector('[data-item-value=ipAddress]') as HTMLDListElement;
const locationOutput = document.querySelector('[data-item-value=location]') as HTMLDListElement;
const timezoneOutput = document.querySelector('[data-item-value=timezone]') as HTMLDListElement;
const ispOutput = document.querySelector('[data-item-value=isp]') as HTMLDListElement;
// Initializing the map
const map = L.map('map', { center: [0, 0], zoom: 4, zoomControl: false });
// Disabling drag, touch and zoom functionality
map.dragging.disable();
map.touchZoom.disable();
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
// Marker icon options
const locationIcon = L.icon({
    iconUrl: (new URL('../assets/img/icon-location.svg', import.meta.url)).toString(),
    iconSize: [35, 45],
    iconAnchor: [25, 16]
});
// Creating the marker
const mapMarker = L.marker([0, 0], { icon: locationIcon });
// Map tile layer options
const mapTiles = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});
mapTiles.addTo(map);
// Function that gets the location and displays it
const getUserLocation = async (query: string): Promise<void> => {
    try {
        const { data }: AxiosResponse<IpifyDetailedResponse> = await axios(`/.netlify/functions/ipify?query=${query}`);
        // Using the flyTo method to animate to the targeted location
        map.flyTo([data.location.lat, data.location.lng], 16);
        // Changing the marker position to the new location and adding it to the map
        mapMarker.setLatLng([data.location.lat, data.location.lng]).addTo(map);
        ipOutput.textContent = data.ip;
        locationOutput.textContent = `${data.location.city}, ${data.location.country} ${data.location.postalCode}`;
        timezoneOutput.textContent = `UTC ${data.location.timezone}`;
        ispOutput.textContent = data.isp;
    }
    catch (error) {
        console.log(error);
    }
};
// Function that adds invalid styling to form elements and injects the error message
const addInvalidStyling = (errorText: string): void => {
    searchInput.classList.add('search-form__input--is-invalid');
    errorMessage.classList.remove('search-form__error-message--is-hidden');
    errorMessage.textContent = errorText;
    searchInput.setAttribute('aria-invalid', 'true');
    errorMessage.setAttribute('aria-live', 'assertive');
}
// Function that removes invalid styling from form elements and deletes the error message
const removeInvalidStyling = () => {
    errorMessage.textContent = '';
    searchInput.classList.remove('search-form__input--is-invalid');
    errorMessage.classList.add('search-form__error-message--is-hidden');
    searchInput.setAttribute('aria-invalid', 'false');
    errorMessage.setAttribute('aria-live', 'off');
}
// Function to handle the form submission
const getSearchInputValue = (e: Event): void => {
    // Preventing the default behavior of the form
    e.preventDefault();
    let query: string
    const searchInputValue = searchInput.value.trim();
    if (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(searchInputValue)) {
        query = `ipAddress=${searchInputValue}`;
        getUserLocation(query);
    }
    else if (/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(searchInputValue)) {
        query = `domain=${searchInputValue}`;
        getUserLocation(query);
    }
    else {
        addInvalidStyling('Please enter a valid IP address or domain');
    }
}

const getUserPublicIp = async () => {
    try {
        const { data }: AxiosResponse<IpifySimpleResponse> = await axios('https://api.ipify.org/?format=json');
        getUserLocation(`ipAddress=${data.ip}`)
    }
    catch (error) {
        console.log(error);
    }
}
// Listening for the submit event on the search form
searchForm.addEventListener('submit', getSearchInputValue);
// Listening for the key press event on the search inputp
searchInput.addEventListener('keydown', removeInvalidStyling);
// Show the user's IP address on the initial page load
document.addEventListener('DOMContentLoaded', getUserPublicIp);

