// src/pages/DashboardPage/DashboardPage.test.jsx

import { describe, expect, test } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './DashboardPage.jsx';
import * as spotifyApi from '../../api/spotify-me.js';
import { beforeEach, afterEach, jest } from '@jest/globals';
import { KEY_ACCESS_TOKEN } from '../../constants/storageKeys.js';
import { buildTitle } from '../../constants/appMeta.js';

// Mock top artist and track data
const topArtistData = {
    items: [
        { 
            id: 'artist1', 
            name: 'Top Artist', 
            genres: ['pop', 'rock'],
            images: [{ url: 'https://via.placeholder.com/64' }], 
            external_urls: { spotify: 'https://open.spotify.com/artist/artist1' } 
        },
    ],
};

const topTrackData = {
    items: [
        { 
            id: 'track1', 
            name: 'Top Track', 
            album: { images: [{ url: 'https://via.placeholder.com/64' }], 
            name: 'Top Album' }, 
            artists: [{ name: 'Artist1' }], 
            external_urls: { spotify: 'https://open.spotify.com/track/track1' } },
    ],
};

// Mock token value
const tokenValue = 'test-token';

// Tests for DashboardPage
describe('DashboardPage', () => {
    // Setup mocks before each test
    beforeEach(() => {
        // Mock localStorage token access
        jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => key === KEY_ACCESS_TOKEN ? tokenValue : null);

        // Default mock: successful top artist and track fetch
        jest.spyOn(spotifyApi, 'fetchUserTopArtists').mockResolvedValue({ data: topArtistData, error: null });
        jest.spyOn(spotifyApi, 'fetchUserTopTracks').mockResolvedValue({ data: topTrackData, error: null });
    });

    // Restore mocks after each test
    afterEach(() => {
        jest.restoreAllMocks();
    });

    // Helper to render DashboardPage
    const renderDashboardPage = () => {
        return render(
            // render DashboardPage within MemoryRouter
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    {/* Dummy login route for redirection when token is expired */}
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );
    };

    // Helper to wait for loading to finish
    const waitForLoadingToFinish = async () => {
        // initial loading state expectations
        expect(screen.queryByTestId('loading-tracks-indicator')).toHaveTextContent(/loading tracks/i);
        expect(screen.queryByTestId('loading-artists-indicator')).toHaveTextContent(/loading artists/i);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-tracks-indicator')).not.toBeInTheDocument();
            expect(screen.queryByTestId('loading-artists-indicator')).not.toBeInTheDocument();
        });
    };

    test('renders dashboard page', async () => {
        // Render the DashboardPage
        renderDashboardPage();

        // Check document title
        expect(document.title).toBe(buildTitle('Dashboard'));

        // wait for loading to finish
        await waitForLoadingToFinish();

        // when loading is done, verify top artist and track content rendered and api called correctly

        // should render main title
        const heading = screen.getByRole('heading', { level: 1, name: /dashboard/i });
        expect(heading).toBeInTheDocument();

        // verify subtitle rendered
        const subtitle = await screen.findByText("Your top artist and track");
        expect(subtitle).toBeInTheDocument()

        // should render top artist card
        const artistCard = screen.getByText(topArtistData.items[0].name);
        expect(artistCard).toBeInTheDocument();

        // should render top track card
        const trackCard = screen.getByText(topTrackData.items[0].name);
        expect(trackCard).toBeInTheDocument();
    });

    test('displays error messages on fetch failure', async () => {
        // Mock fetchUserTopArtists to return error
        jest.spyOn(spotifyApi, 'fetchUserTopArtists').mockResolvedValue({ data: null, error: 'Failed to fetch top artists' });
        // Mock fetchUserTopTracks to return error
        jest.spyOn(spotifyApi, 'fetchUserTopTracks').mockResolvedValue({ data: null, error: 'Failed to fetch top tracks' });

        // Render the DashboardPage
        renderDashboardPage();

        // wait for loading to finish
        await waitForLoadingToFinish();

        // should display error message for top artists
        const artistError = screen.getByTestId('error-artists-indicator');
        expect(artistError).toHaveTextContent('Failed to fetch top artists');

        // should display error message for top tracks
        const trackError = screen.getByTestId('error-tracks-indicator');
        expect(trackError).toHaveTextContent('Failed to fetch top tracks');
    });

    test('displays error messages on fetch failure exceptions', async () => {
        // Mock fetchUserTopArtists to throw error
        jest.spyOn(spotifyApi, 'fetchUserTopArtists').mockRejectedValue(new Error('Network error for artists'));
        // Mock fetchUserTopTracks to throw error
        jest.spyOn(spotifyApi, 'fetchUserTopTracks').mockRejectedValue(new Error('Network error for tracks'));

        // Render the DashboardPage
        renderDashboardPage();

        // wait for loading to finish
        await waitForLoadingToFinish();

        // should display error message for top artists
        const artistError = screen.getByTestId('error-artists-indicator');
        expect(artistError).toHaveTextContent('Network error for artists');

        // should display error message for top tracks
        const trackError = screen.getByTestId('error-tracks-indicator');
        expect(trackError).toHaveTextContent('Network error for tracks');
    });

    test('redirects to login on token expiration', async () => {
        // Mock fetchUserTopArtists to return token expired error
        jest.spyOn(spotifyApi, 'fetchUserTopArtists').mockResolvedValue({ data: null, error: 'The access token expired' });
        // Mock fetchUserTopTracks to return token expired error
        jest.spyOn(spotifyApi, 'fetchUserTopTracks').mockResolvedValue({ data: null, error: 'The access token expired' });

        // Render the DashboardPage
        renderDashboardPage();

        // Wait for loading to finish
        await waitForLoadingToFinish();

        // Verify redirection to login page
        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
});