// Get DOM elements
const countryInput = document.getElementById('country-input');
const searchBtn = document.getElementById('search-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const countryInfo = document.getElementById('country-info');
const borderingCountries = document.getElementById('bordering-countries');
const errorMessage = document.getElementById('error-message');

// Hide spinner initially
loadingSpinner.classList.add('hidden');

// Main search function (REQUIRED: async/await + try/catch)
async function searchCountry(countryName) {
    if (!countryName) {
        showError('Please enter a country name.');
        return;
    }

    try {
        // Clear previous results
        errorMessage.textContent = '';
        countryInfo.innerHTML = '';
        borderingCountries.innerHTML = '';

        // Show loading spinner
        loadingSpinner.classList.remove('hidden');

        // Fetch country data
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);

        if (!response.ok) {
            throw new Error('Country not found.');
        }

        const data = await response.json();
        const country = data[0];

        // Update main country info
        countryInfo.innerHTML = `
            <h2>${country.name.common}</h2>
            <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
            <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
            <p><strong>Region:</strong> ${country.region}</p>
            <img src="${country.flags.svg}" alt="${country.name.common} flag" width="150">
        `;

        // Fetch bordering countries if they exist
        if (country.borders && country.borders.length > 0) {
            const borderPromises = country.borders.map(code =>
                fetch(`https://restcountries.com/v3.1/alpha/${code}`)
                    .then(res => res.json())
                    .then(data => data[0])
            );

            const borderCountries = await Promise.all(borderPromises);

            borderingCountries.innerHTML = borderCountries.map(border => `
                <div>
                    <p>${border.name.common}</p>
                    <img src="${border.flags.svg}" alt="${border.name.common} flag" width="80">
                </div>
            `).join('');
        } else {
            borderingCountries.innerHTML = '<p>No bordering countries.</p>';
        }

    } catch (error) {
        showError(error.message || 'Something went wrong. Please try again.');
    } finally {
        // Hide loading spinner
        loadingSpinner.classList.add('hidden');
    }
}

// Error handling function
function showError(message) {
    errorMessage.textContent = message;
}

// Event listener: Button click
searchBtn.addEventListener('click', () => {
    const country = countryInput.value.trim();
    searchCountry(country);
});

// Event listener: Press Enter key
countryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const country = countryInput.value.trim();
        searchCountry(country);
    }
});