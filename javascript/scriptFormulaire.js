document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (!form) return;

    /**
     * Fonctions d'affichage des erreurs
     */
    function appliquerErreur(element) {
        if (!element) return;

        element.style.setProperty('border', '2px solid #dc3545', 'important');
        element.style.setProperty('box-shadow', '0 0 8px rgba(220, 53, 69, 0.5)', 'important');
        element.style.setProperty('background-color', '#fff5f5', 'important');
        element.style.setProperty('border-radius', '6px', 'important');

        if (element.tagName === 'DIV') {
            element.style.setProperty('padding', '0.5rem', 'important');
        }
    }

    function retirerErreur(element) {
        if (!element) return;

        element.style.removeProperty('border');
        element.style.removeProperty('box-shadow');
        element.style.removeProperty('background-color');
        element.style.removeProperty('border-radius');
        element.style.removeProperty('padding');
    }

    function retirerErreurDuGroupe(nomRadio) {
        const premierRadio = document.querySelector(`input[name="${nomRadio}"]`);

        if (premierRadio) {
            const conteneurFlex = premierRadio.parentElement.parentElement;

            if (conteneurFlex) {
                retirerErreur(conteneurFlex);
            }
        }
    }

    /**
     * Nettoyage automatique des erreurs
     */

    document.querySelectorAll('input[name="role"]').forEach(radio => {
        radio.addEventListener('change', () => {
            retirerErreurDuGroupe('role');
        });
    });

    const tousLesChamps = form.querySelectorAll('input, select, textarea');

    tousLesChamps.forEach(champ => {
        champ.addEventListener('input', () => {
            if (champ.value.trim() !== '') {
                retirerErreur(champ);
            }
        });

        champ.addEventListener('change', () => {
            if (
                champ.type === 'checkbox' ||
                champ.type === 'radio' ||
                champ.value !== ''
            ) {
                retirerErreur(champ);
            }
        });
    });

    /**
     * Réinitialisation du formulaire
     */
    form.addEventListener('reset', () => {
        const tousLesElements = form.querySelectorAll(
            'input, select, textarea, div'
        );

        tousLesElements.forEach(element => {
            retirerErreur(element);
        });
    });

    /**
     * Validation et soumission
     */
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        let champsManquants = [];

        // 1. Champs obligatoires
        const champsObligatoires = [
            { id: 'prenom', nom: 'Prénom' },
            { id: 'nom', nom: 'Nom' },
            { id: 'telephone', nom: 'Téléphone' },
            { id: 'email', nom: 'Adresse e-mail' },
            { id: 'ville', nom: 'Ville' }
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

        // 2. Validation du rôle
        const roleOption = document.querySelector(
            'input[name="role"]:checked'
        );

        const premierRadioRole = document.querySelector(
            'input[name="role"]'
        );

        const blocFlexRole = premierRadioRole
            ? premierRadioRole.parentElement.parentElement
            : null;

        if (!roleOption) {
            if (blocFlexRole) {
                appliquerErreur(blocFlexRole);
            }

            champsManquants.push(
                'Votre participation (Bénévole, Visiteur...)'
            );
        } else {
            if (blocFlexRole) {
                retirerErreur(blocFlexRole);
            }
        }

        // 3. Validation RGPD
        const checkboxRgpd = form.querySelector(
            'input[type="checkbox"][required]'
        );

        const labelRgpd = checkboxRgpd?.parentElement;

        if (checkboxRgpd && !checkboxRgpd.checked) {
            if (labelRgpd) {
                appliquerErreur(labelRgpd);
            }

            champsManquants.push(
                "L'acceptation de l'utilisation des données (RGPD)"
            );
        } else if (checkboxRgpd) {
            retirerErreur(labelRgpd);
        }

        /**
         * Affichage des erreurs
         */
        if (champsManquants.length > 0) {
            alert(
                `Impossible d'envoyer le formulaire.\n\nChamps obligatoires manquants :\n• ${champsManquants.join('\n• ')}`
            );

            return;
        }

        /**
         * Compétences sélectionnées
         */
        const competences = [];

        form.querySelectorAll(
            'input[type="checkbox"]:not([required]):checked'
        ).forEach(cb => {
            competences.push(cb.value);
        });

        /**
         * Construction de l'objet
         */
        const formData = {
            client: {
                prenom: document.getElementById('prenom').value.trim(),
                nom: document.getElementById('nom').value.trim(),
                email: document.getElementById('email').value.trim(),
                telephone: document.getElementById('telephone').value.trim(),
                ville: document.getElementById('ville').value.trim()
            },

            participation: {
                role: roleOption.value,
                competences: competences,
                disponibilites:
                    document.getElementById('disponibilites').value ||
                    'Non spécifié',
                message:
                    document.getElementById('message').value.trim() ||
                    'Aucune précision'
            },

            dateSoumission: new Date().toISOString()
        };

        console.log('Données envoyées avec succès :', formData);

        alert(
            `Merci ${formData.client.prenom} ! Votre demande a bien été enregistrée.`
        );

        form.reset();
    });
});
