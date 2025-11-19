// src/pages/PlaylistsPage.test.jsx

import { describe, expect, test } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PlaylistPage from './PlaylistPage.jsx';
import * as spotifyApi from '../../api/spotify-playlists.js';
import { beforeEach, afterEach, jest } from '@jest/globals';
import { KEY_ACCESS_TOKEN } from '../../constants/storageKeys.js';
import { buildTitle } from '../../constants/appMeta.js';

const playlistData = {
    id: 'playlist1',
    name: 'My Playlist 1',
    description: 'A cool playlist',
    images: [{ url: 'https://via.placeholder.com/56' }],
    owner: { display_name: 'User1' },
    external_urls: { spotify: 'https://open.spotify.com/playlist/playlist1' },
    tracks: {
        items: [
            {
                track: {
                    id: 'track1',
                    name: 'Track One',
                    artists: [{ name: 'Artist A' }],
                    album: { name: 'Album X', images: [{ url: 'https://via.placeholder.com/56' }] },
                    duration_ms: 210000,
                    external_urls: { spotify: 'https://open.spotify.com/track/track1' },
                },
            },
            {
                track: {
                    id: 'track2',
                    name: 'Track Two',
                    artists: [{ name: 'Artist B' }],
                    album: { name: 'Album Y', images: [{ url: 'https://via.placeholder.com/56' }] },
                    duration_ms: 180000,
                    external_urls: { spotify: 'https://open.spotify.com/track/track2' },
                },
            }
        ],
        total: 2,
    },
};

// Mock token value
const tokenValue = 'test-token';


describe('PlaylistPage', () => {
    // Setup mocks before each test
    beforeEach(() => {
        // Mock localStorage token
        jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => key === KEY_ACCESS_TOKEN ? tokenValue : null);
        
        // Default mock: successful playlist fetch
        jest.spyOn(spotifyApi, 'fetchPlaylistById').mockResolvedValue({ data: playlistData, error: null });
    });

    // Restore mocks after each test
    afterEach(() => {
        jest.restoreAllMocks();
    });

    // Helper to render PlaylistPage
    const renderPlaylistPage = (playlistId) => {
        return render(
            <MemoryRouter initialEntries={[`/playlist/${playlistId}`]}>
                <Routes>
                    <Route path="/playlist/:id" element={<PlaylistPage />} />
                    {/* Dummy login route for redirection when token is expired */}
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );
    };

    // Helper to wait for loading to finish
    const waitForLoadingToFinish = async () => {
        // initial loading state expectations
        expect(screen.getByRole('status')).toHaveTextContent(/Loading playlist/i);
        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
        });
    };

    test('renders playlist page', async () => {
        // Render the PlaylistPage
        renderPlaylistPage('playlist1');

        // Check document title
        expect(document.title).toBe(buildTitle('Playlist'));

        // when loading is done, verify playlist content rendered and api called correctly
        await waitForLoadingToFinish();

        // should call fetchPlaylistById with the token and playlist id
        expect(spotifyApi.fetchPlaylistById).toHaveBeenCalledTimes(1);
        expect(spotifyApi.fetchPlaylistById).toHaveBeenCalledWith(tokenValue, playlistData.id);

        // should render a heading of level 1 with text of playlist name
        const heading = await screen.findByRole('heading', { level: 1, name: playlistData.name });
        expect(heading).toBeInTheDocument();

        // should render playlist cover image
        const img = screen.getByAltText(`Cover of ${playlistData.name}`);
        expect(img).toHaveAttribute('src', playlistData.images[0].url);

        // should render playlist description
        const description = await screen.findByRole('heading', { level: 2, name: playlistData.description });
        expect(description).toBeInTheDocument();

        // should render link to open playlist in Spotify
        const link = screen.getByRole('link', { name: /spotify/i });
        expect(link).toHaveAttribute('href', playlistData.external_urls.spotify);
        expect(link).toHaveTextContent(/open in spotify/i);

        // should render tracks in the playlist
        for (const track of playlistData.tracks.items) {
            expect(await screen.findByTestId(`track-item-${track.track.id}`)).toBeInTheDocument();
        }   
    });

    test('displays error message on fetchPlaylistById error', async () => {
        // Mock fetchPlaylistById to return an error
        jest.spyOn(spotifyApi, 'fetchPlaylistById').mockResolvedValue({ data: null, error: 'Failed to fetch playlist' });
        
        // Render the PlaylistPage
        renderPlaylistPage('playlist1');

        // wait for loading to finish
        await waitForLoadingToFinish();
        
        // when loading is done, verify error message displayed
        const errorMessage = await screen.findByRole('alert');
        expect(errorMessage).toHaveTextContent('Failed to fetch playlist');
    });

    test('displays error message on fetchPlaylistById failure', async () => {
        // Mock fetchPlaylistById to throw an error
        jest.spyOn(spotifyApi, 'fetchPlaylistById').mockRejectedValue(new Error('Network error'));
        
        // Render the PlaylistPage
        renderPlaylistPage('playlist1');

        // wait for loading to finish
        await waitForLoadingToFinish();
        
        // when loading is done, verify error message displayed
        const errorMessage = await screen.findByRole('alert');
        expect(errorMessage).toHaveTextContent('Network error');
    });

    test('redirects to login on token expiration', async () => {
        // Mock fetchPlaylistById to return token expired error
        jest.spyOn(spotifyApi, 'fetchPlaylistById').mockResolvedValue({ data: null, error: 'The access token expired' });
        
        // Render the PlaylistPage
        renderPlaylistPage('playlist1');

        // Wait for loading to finish
        await waitForLoadingToFinish();

        // verify redirection to login page
        const loginText = await screen.findByText('Login Page');
        expect(loginText).toBeInTheDocument();
    });
    
    test('verify styling and accessibility attributes using role', async () => {
        // Render the PlaylistPage
        renderPlaylistPage('playlist1');

        // wait for loading to finish
        await waitForLoadingToFinish();

        // should have section landmark with appropriate class names
        const region = screen.getByRole('region', { name: 'My Playlist 1' });
        expect(region).toHaveClass('playlist-container', 'page-container');

        // should have heading level 1 with appropriate class name
        const heading1 = screen.getByRole('heading', { level: 1, name: 'My Playlist 1' });
        expect(heading1).toHaveClass('playlist-title', 'page-title');

        // should have heading level 2 with appropriate class name
        const heading2 = screen.getByRole('heading', { level: 2, name: 'A cool playlist' });
        expect(heading2).toHaveClass('playlist-subtitle', 'page-subtitle'); 

       // should have ordered list with appropriate class name
        const list = screen.getByRole('list');
        expect(list).toHaveClass('playlist-list');
    });
});