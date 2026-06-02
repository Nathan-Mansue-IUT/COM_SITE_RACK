document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (!form) return;

    // Éléments liés à l'option "Autre"
    const radioAppareils = document.querySelectorAll('input[name="type-appareil"]');
    const containerAutre = document.getElementById('champ-autre-appareil');
    const inputAutre = document.getElementById('type-appareil-autre');

    /**
     * Gère la visibilité et l'obligation du champ "Autre"
     */
    function gererChampAutre() {
        const optionAutreCochee = document.getElementById('radio-autre')?.checked;
        
        if (optionAutreCochee) {
            containerAutre.style.display = 'block';
            inputAutre.required = true;
            inputAutre.focus();
        } else {
            containerAutre.style.display = 'none';
            inputAutre.required = false;
            inputAutre.value = '';
            retirerErreur(inputAutre);
        }
    }

    // Écouter les changements sur chaque bouton radio du type d'appareil
    radioAppareils.forEach(radio => {
        radio.addEventListener('change', () => {
            gererChampAutre();
            retirerErreurDuGroupe('type-appareil');
        });
    });

    // Nettoyer l'erreur au clic sur les radios d'actions
    document.querySelectorAll('input[name="action-materiel"]').forEach(radio => {
        radio.addEventListener('change', () => retirerErreurDuGroupe('action-materiel'));
    });

    /**
     * Fonctions d'affichage des erreurs (Contours rouges forcés)
     */
    function appliquerErreur(element) {
        element.style.setProperty('border', '2px solid #dc3545', 'important');
        element.style.setProperty('box-shadow', '0 0 8px rgba(220, 53, 69, 0.5)', 'important');
        element.style.setProperty('background-color', '#fff5f5', 'important');
        element.style.setProperty('border-radius', '6px', 'important');
        
        // Si c'est le bloc de boutons radio, on ajoute un petit padding pour que ce soit propre
        if (element.tagName === 'DIV') {
            element.style.setProperty('padding', '0.5rem', 'important');
        }
    }

    function retirerErreur(element) {
        element.style.removeProperty('border');
        element.style.removeProperty('box-shadow');
        element.style.removeProperty('background-color');
        element.style.removeProperty('border-radius');
        element.style.removeProperty('padding');
    }

    function retirerErreurDuGroupe(nomRadio) {
        const premierRadio = document.querySelector(`input[name="${nomRadio}"]`);
        if (premierRadio) {
            // On cible la div parente directe qui contient la liste flexbox des options
            const conteneurFlex = premierRadio.parentElement.parentElement;
            if (conteneurFlex) retirerErreur(conteneurFlex);
        }
    }

    // Supprimer le contour rouge dès que l'utilisateur écrit dans un champ textuel
    const champsTextes = form.querySelectorAll('input[type="text"], input[type="email"], textarea');
    champsTextes.forEach(champ => {
        champ.addEventListener('input', () => {
            if (champ.value.trim() !== '') {
                retirerErreur(champ);
            }
        });
    });

    // Réinitialisation du formulaire
    form.addEventListener('reset', () => {
        const tousLesChamps = form.querySelectorAll('input, select, textarea, div');
        tousLesChamps.forEach(retirerErreur);
        setTimeout(gererChampAutre, 10);
    });

    /**
     * Soumission et Validation du formulaire
     */
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        let champsManquants = [];

        // 1. Validation des champs textes classiques (Infos personnelles)
        const champsObligatoires = [
            { id: 'prenom', nom: 'Prénom' },
            { id: 'nom', nom: 'Nom' },
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

        // 2. Validation des boutons radio : Action souhaitée (Déposer, Louer, Recycler)
        const actionOption = document.querySelector('input[name="action-materiel"]:checked');
        const premierRadioAction = document.querySelector('input[name="action-materiel"]');
        const blocFlexAction = premierRadioAction ? premierRadioAction.parentElement.parentElement : null;

        if (!actionOption) {
            if (blocFlexAction) appliquerErreur(blocFlexAction);
            champsManquants.push('Votre intention (Déposer, Louer ou Recycler)');
        } else {
            if (blocFlexAction) retirerErreur(blocFlexAction);
        }

        // 3. Validation des boutons radio : Type d'appareil (Informatique, Électronique, Autre)
        const typeOption = document.querySelector('input[name="type-appareil"]:checked');
        const premierRadioType = document.querySelector('input[name="type-appareil"]');
        const blocFlexType = premierRadioType ? premierRadioType.parentElement.parentElement : null;

        if (!typeOption) {
            if (blocFlexType) appliquerErreur(blocFlexType);
            champsManquants.push("Le type d'appareil");
        } else {
            if (blocFlexType) retirerErreur(blocFlexType);
        }

        // 4. Validation spécifique du champ "Autre" s'il est actif
        let typeAppareilFinal = typeOption ? typeOption.value : null;
        if (typeAppareilFinal === 'autre') {
            if (!inputAutre.value.trim()) {
                appliquerErreur(inputAutre);
                champsManquants.push("La précision du type d'appareil");
            } else {
                retirerErreur(inputAutre);
                typeAppareilFinal = inputAutre.value.trim();
            }
        }

        // 5. Validation de la case RGPD
        const checkboxRgpd = form.querySelector('input[type="checkbox"][required]');
        const labelRgpd = checkboxRgpd?.parentElement;
        if (checkboxRgpd && !checkboxRgpd.checked) {
            if (labelRgpd) appliquerErreur(labelRgpd);
            champsManquants.push("L'acceptation de l'utilisation des données (RGPD)");
        } else if (checkboxRgpd) {
            if (labelRgpd) retirerErreur(labelRgpd);
        }

        // Affichage des erreurs si besoin
        if (champsManquants.length > 0) {
            alert(`Impossible d'envoyer le formulaire.\n\nChamps obligatoires manquants :\n• ${champsManquants.join('\n• ')}`);
            return;
        }

        // Si tout est OK, traitement final
        const formData = {
            client: {
                prenom: document.getElementById('prenom').value.trim(),
                nom: document.getElementById('nom').value.trim(),
                email: document.getElementById('email').value.trim(),
                telephone: document.getElementById('telephone').value.trim(),
                ville: document.getElementById('ville').value.trim()
            },
            materiel: {
                action: actionOption.value,
                type: typeAppareilFinal,
                etat: document.getElementById('etat-materiel').value || 'Non spécifié',
                details: document.getElementById('message').value.trim() || 'Aucune précision'
            },
            dateSoumission: new Date().toISOString()
        };

        console.log('Données envoyées avec succès :', formData);
        alert(`Merci ${formData.client.prenom} ! Votre demande a bien été enregistrée.`);
        
        form.reset();
        gererChampAutre();
    });
});