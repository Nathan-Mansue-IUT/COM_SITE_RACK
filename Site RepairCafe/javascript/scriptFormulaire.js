document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (!form) return;

    function appliquerErreur(element) {
        if (!element) return;

        element.style.setProperty('border', '2px solid #dc3545', 'important');
        element.style.setProperty('box-shadow', '0 0 8px rgba(220, 53, 69, 0.5)', 'important');
        element.style.setProperty('background-color', '#fff5f5', 'important');
        element.style.setProperty('border-radius', '6px', 'important');
    }

    function retirerErreur(element) {
        if (!element) return;

        element.style.removeProperty('border');
        element.style.removeProperty('box-shadow');
        element.style.removeProperty('background-color');
        element.style.removeProperty('border-radius');
    }

    const champs = form.querySelectorAll('input, select');

    champs.forEach(champ => {
        champ.addEventListener('input', () => {
            if (champ.value.trim() !== '') {
                retirerErreur(champ);
            }
        });

        champ.addEventListener('change', () => {
            if (champ.value !== '') {
                retirerErreur(champ);
            }
        });
    });

    form.addEventListener('reset', () => {
        champs.forEach(retirerErreur);
    });

    form.addEventListener('submit', event => {
        event.preventDefault();

        let champsManquants = [];

        const champsObligatoires = [
            { id: 'email', nom: 'Adresse e-mail' },
            { id: 'telephone', nom: 'Numéro de téléphone' },
            { id: 'date', nom: 'Date souhaitée pour déposer votre machine' },
            { id: 'salle', nom: 'Salle disponible' },
            { id: 'heure', nom: 'Heure souhaitée' }
        ];

        champsObligatoires.forEach(champ => {
            const input = document.getElementById(champ.id);

            if (!input || !input.value.trim()) {
                appliquerErreur(input);
                champsManquants.push(champ.nom);
            } else {
                retirerErreur(input);
            }
        });

        if (champsManquants.length > 0) {
            alert(
                `Impossible d'envoyer le formulaire.\n\nChamps obligatoires manquants :\n• ${champsManquants.join('\n• ')}`
            );
            return;
        }

        const formData = {
            coordonnees: {
                email: document.getElementById('email').value.trim(),
                telephone: document.getElementById('telephone').value.trim()
            },
            rendezVous: {
                date: document.getElementById('date').value,
                salle: document.getElementById('salle').value,
                heure: document.getElementById('heure').value
            },
            dateSoumission: new Date().toISOString()
        };

        console.log('Données envoyées avec succès :', formData);

        alert('Merci ! Votre demande de réparation a bien été enregistrée.');

        form.reset();
    });
});
