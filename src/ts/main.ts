// Importing libraries and interfaces
import * as L from 'leaflet';
import axios, { AxiosResponse } from 'axios';
import { IpifyDetailedResponse, IpifySimpleResponse } from './interfaces';

// Selecting necessary elements from the DOM
const searchForm = document.querySelector('[data-search-form]') as HTMLFormElement;
const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
const inputError = document.querySelector('[data-input-error]') as HTMLParagraphElement;
const ipOutput = document.querySelector('[data-output=ipAddress]') as HTMLDListElement;
const locationOutput = document.querySelector('[data-output=location]') as HTMLDListElement;
const timezoneOutput = document.querySelector('[data-output=timezone]') as HTMLDListElement;
const ispOutput = document.querySelector('[data-output=isp]') as HTMLDListElement;
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
    iconUrl: `${new URL('../assets/img/icon-location.svg', import.meta.url)}`,
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
        console.log(data);
        map.flyTo([data.location.lat, data.location.lng], 16);
        // Changing the marker position to the new location and adding it to the map
        mapMarker.setLatLng([data.location.lat, data.location.lng]).addTo(map);
        ipOutput.textContent = data.ip;
        locationOutput.textContent = `${data.location.city}, ${data.location.country} ${data.location.postalCode}`;
        timezoneOutput.textContent = `UTC ${data.location.timezone}`;
        ispOutput.textContent = data.isp;
    }
    catch (error) {
        searchInput.classList.add('search-form__input--is-invalid');
        inputError.classList.remove('search-form__error--is-hidden');
        inputError.textContent = 'Something went wrong. Please try again.';
        searchInput.setAttribute('aria-invalid', 'true');
        inputError.setAttribute('aria-live', 'assertive');
        setTimeout(removeInvalidStyles, 5000);
    }
};
// Function that removes invalid styling from the search input
const removeInvalidStyles = () => {
    if (searchInput.classList.contains('search-form__input--is-invalid')) {
        searchInput.classList.remove('search-form__input--is-invalid');
    }
    if (inputError.classList.contains('search-form__error--is-hidden')) {
        inputError.classList.add('search-form__error--is-hidden');
    }
    searchInput.setAttribute('aria-invalid', 'false');
    inputError.setAttribute('aria-live', 'off');
}
// Function to handle the form submission
const getSearchInputValue = (e: Event): void => {
    // Preventing the default behavior of the form
    e.preventDefault();
    let query: string
    const searchInputValue = searchInput.value.trim();
    if (searchInputValue === '') {
        searchInput.classList.add('search-form__input--is-invalid');
        inputError.classList.remove('search-form__error--is-hidden');
        inputError.textContent = 'This field is required';
        searchInput.setAttribute('aria-invalid', 'true');
        inputError.setAttribute('aria-live', 'assertive');
        setTimeout(removeInvalidStyles, 7000);
    }
    else if (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(searchInputValue)) {
        query = `ipAddress=${searchInputValue}`;
        getUserLocation(query);
    }
    else if (/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(searchInputValue)) {
        query = `domain=${searchInputValue}`;
        getUserLocation(query);
    }
    else {
        searchInput.classList.add('search-form__input--is-invalid');
        inputError.classList.remove('search-form__error--is-hidden');
        inputError.textContent = 'Please enter a valid IP address or domain name';
        searchInput.setAttribute('aria-invalid', 'true');
        inputError.setAttribute('aria-live', 'assertive');
        setTimeout(removeInvalidStyles, 7000);
    }
}
// Listening for the submit event on the search form
searchForm.addEventListener('submit', getSearchInputValue);
// Listening for the key press event on the search input
searchInput.addEventListener('keydown', removeInvalidStyles);
// Show the user's IP address on the initial page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data }: AxiosResponse<IpifySimpleResponse> = await axios('https://api.ipify.org/?format=json');
        getUserLocation(`ipAddress=${data.ip}`)
    }
    catch (error) {
        console.log(error);
    }
});

