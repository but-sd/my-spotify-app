# ✨ - Ajout de la page de détail de la playlist

## Objectif

Créer une page de détail pour afficher les informations d'une playlist Spotify spécifique avec les fonctionnalités suivantes :

1. **Récupération des données de la playlist** :
   - La fonction **fetchPlaylistById** permet de récupérer les informations d'une playlist et ses pistes en utilisant l'ID de la playlist.
   - Gérer les erreurs potentielles lors de la récupération des données (playlist inexistante, erreur réseau, etc.).

2. **Affichage des informations de la playlist** :
   - Afficher le nom de la playlist, la description et l'image de couverture en haut de la page.
   - Afficher la liste des pistes avec les informations déjà présentées dans la page **Top Tracks**.
   - Gérer les cas où la playlist est vide ou n'existe pas ou en cas d'erreur de récupération des données.

3. **Fonctionnalités supplémentaires** :
   - Ajouter un bouton "Lire la playlist" qui ouvre la playlist dans l'application Spotify.
   - Permettre d'accéder à la page de détail de la playlist en cliquant sur une playlist dans la liste des playlists.

![Copie d'écran](https://github.com/alexandre-girard-maif/music-discovery-app-template/blob/develop/instructions/feature-playlist-detail-page/playlist-detail-page.png?raw=true)


## Critères d'acceptation
- La page de détail de la playlist doit afficher correctement les informations de la playlist et la liste des pistes.
- Les erreurs lors de la récupération des données doivent être gérées et affichées de manière appropriée.
- Les fonctionnalités supplémentaires doivent être implémentées et fonctionner correctement.
- Les tests doivent être passés avec succès avec le test `instructions/playlist-detail-page/ressources/PlaylistPage.test.jsx` à déplacer dans les sources.
- Le style de la page doit utiliser `instructions/feature-playlist-detail-page/ressources/PlaylistPage.css`.

## Conseils d'implémentation

Procédez par étapes pour implémenter cette fonctionnalité et testez chaque partie au fur et à mesure :
- Commencer par créer une nouvelle route pour la page de détail de la playlist, elle devrait être accessible via une URL comme `/playlist/:id`.
- Créer une première version du composant de la page de détail de la playlist simplifiée :
````jsx
export default function PlaylistPage() {
    return <div>Playlist Page</div>;
}
````
- Vérifier que la navigation vers cette page fonctionne correctement en y accédant via l'URL.

- Faire évoluer le nouveau composant `PlaylistPage` qui est responsable de l'affichage des informations de la playlist en se basant sur une page existante comme `TopTracksPage`.
   - Dans un premier temps modifer le composant pour afficher l'identifiant de la playlist récupéré depuis les paramètres de l'URL via les paramètres de l'URL (React Router `useParams`).
   - Utiliser la fonction `fetchPlaylistById` pour récupérer les données de la playlist en utilisant l'identifiant et afficher le résultat dans la console pour vérifier que les données sont correctement récupérées et le format des données. Par exemple, pour accéder à la première piste de la playlist, vous pouvez utiliser : `playlist.tracks.items[0].track`. Utiliser un véritable identifiant de l'une de vos playlists pour vérifier le bon fonctionnement.
   - Mettre en place l'affichage des informations de la playlist (nom, description, image de couverture, lien) en haut de la page.
   - Implémenter l'affichage de la liste des pistes de la playlist, le composant **TrackItem** doit être réutilisé pour afficher chaque piste.
- Modifier le composant `src/components/PlayListItem.jsx` pour modifier un lien vers la page de détail de la playlist en utilisant l'ID de la playlist lorsque l'utilisateur clique sur une playlist dans la liste des playlists. Modifier également le test, l'implémentation ayant changé.
- Ajouter les tests nécessaires pour valider le bon fonctionnement de la page de détail de la playlist en déplaçant le test fourni `instructions/playlist-detail-page/ressources/PlaylistPage.test.jsx` dans les sources.
- Ajouter des tests supplémentaires si nécessaire pour couvrir les cas d'erreur (playlist inexistante, erreur réseau, playlist vide, etc.).

Des commits clairs et descriptifs doivent être faits à chaque étape pour permettre une revue de code efficace.
