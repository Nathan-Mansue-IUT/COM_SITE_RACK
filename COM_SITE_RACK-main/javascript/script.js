/**
 * Repair Café — Validation du formulaire
 * Analyse les champs à la soumission ET en temps réel (au blur),
 * colore les labels en rouge si invalide, en vert si valide.
 */

document.addEventListener("DOMContentLoaded", () => {

  const form = document.querySelector("form");

  /* ─── Utilitaires ─────────────────────────────────────────────────── */

  /**
   * Marque un champ comme invalide :
   *  - bordure rouge sur l'input/select/textarea
   *  - label coloré en rouge
   *  - affiche (ou crée) un message d'erreur sous le champ
   */
  function setInvalid(field, message) {
    field.classList.remove("is-valid");
    field.classList.add("is-invalid");

    const label = getLabel(field);
    if (label) label.style.color = "var(--bs-danger, #dc3545)";

    let feedback = field.parentElement.querySelector(".invalid-feedback");
    if (!feedback) {
      feedback = document.createElement("div");
      feedback.classList.add("invalid-feedback");
      field.insertAdjacentElement("afterend", feedback);
    }
    feedback.textContent = message;
  }

  /**
   * Marque un champ comme valide.
   */
  function setValid(field) {
    field.classList.remove("is-invalid");
    field.classList.add("is-valid");

    const label = getLabel(field);
    if (label) label.style.color = "var(--bs-success, #198754)";

    const feedback = field.parentElement.querySelector(".invalid-feedback");
    if (feedback) feedback.textContent = "";
  }

  /**
   * Réinitialise le style d'un champ (ni valide ni invalide).
   */
  function resetField(field) {
    field.classList.remove("is-invalid", "is-valid");
    const label = getLabel(field);
    if (label) label.style.color = "";
    const feedback = field.parentElement.querySelector(".invalid-feedback");
    if (feedback) feedback.textContent = "";
  }

  /**
   * Retrouve le <label> associé à un champ via l'attribut `for`.
   */
  function getLabel(field) {
    if (field.id) {
      return document.querySelector(`label[for="${field.id}"]`);
    }
    return null;
  }

  /* ─── Gestion spéciale : groupes radio & checkbox ─────────────────── */

  /**
   * Marque le groupe radio "role" comme invalide.
   */
  function setRadioGroupInvalid(message) {
    const groupLabel = document.querySelector('label.form-label[for="role"], .mb-3 > .form-label');
    // On cible le label du groupe (le premier label de la section participation)
    const allRoleLabels = document.querySelectorAll('input[name="role"]');
    allRoleLabels.forEach(r => r.classList.add("is-invalid"));

    // Affiche le message après le dernier radio
    const lastRadioWrapper = document.querySelector("#les-deux").closest(".form-check");
    let feedback = lastRadioWrapper.parentElement.querySelector(".invalid-feedback");
    if (!feedback) {
      feedback = document.createElement("div");
      feedback.classList.add("invalid-feedback");
      feedback.style.display = "block"; // les radios n'appliquent pas display auto
      lastRadioWrapper.insertAdjacentElement("afterend", feedback);
    }
    feedback.textContent = message;

    // Colore le label de groupe
    const groupLabelEl = document.querySelector('label.form-label');
    const sectionLabel = [...document.querySelectorAll('.mb-3 > .form-label')]
      .find(el => el.textContent.includes("participer en tant que"));
    if (sectionLabel) sectionLabel.style.color = "var(--bs-danger, #dc3545)";
  }

  function clearRadioGroupError() {
    document.querySelectorAll('input[name="role"]').forEach(r => {
      r.classList.remove("is-invalid");
      r.classList.add("is-valid");
    });
    const feedback = document.querySelector("#les-deux").closest(".form-check")
      .parentElement.querySelector(".invalid-feedback");
    if (feedback) feedback.textContent = "";

    const sectionLabel = [...document.querySelectorAll('.mb-3 > .form-label')]
      .find(el => el.textContent.includes("participer en tant que"));
    if (sectionLabel) sectionLabel.style.color = "var(--bs-success, #198754)";
  }

  /**
   * Marque la checkbox RGPD comme invalide.
   */
  function setCheckboxInvalid(checkbox, message) {
    checkbox.classList.add("is-invalid");
    const label = document.querySelector(`label[for="${checkbox.id}"]`);
    if (label) label.style.color = "var(--bs-danger, #dc3545)";

    let feedback = checkbox.closest(".form-check").querySelector(".invalid-feedback");
    if (!feedback) {
      feedback = document.createElement("div");
      feedback.classList.add("invalid-feedback");
      feedback.style.display = "block";
      checkbox.closest(".form-check").appendChild(feedback);
    }
    feedback.textContent = message;
  }

  function setCheckboxValid(checkbox) {
    checkbox.classList.remove("is-invalid");
    checkbox.classList.add("is-valid");
    const label = document.querySelector(`label[for="${checkbox.id}"]`);
    if (label) label.style.color = "var(--bs-success, #198754)";
    const feedback = checkbox.closest(".form-check").querySelector(".invalid-feedback");
    if (feedback) feedback.textContent = "";
  }

  /* ─── Règles de validation par champ ─────────────────────────────── */

  const validators = {

    prenom(value) {
      if (!value.trim()) return "Le prénom est obligatoire.";
      if (value.trim().length < 2) return "Le prénom doit contenir au moins 2 caractères.";
      return null;
    },

    nom(value) {
      if (!value.trim()) return "Le nom est obligatoire.";
      if (value.trim().length < 2) return "Le nom doit contenir au moins 2 caractères.";
      return null;
    },

    email(value) {
      if (!value.trim()) return "L'adresse e-mail est obligatoire.";
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(value)) return "Veuillez saisir une adresse e-mail valide (ex : nom@domaine.fr).";
      return null;
    },

    telephone(value) {
      if (!value.trim()) return null; // Champ facultatif
      const re = /^(\+?\d[\d\s\-().]{7,19})$/;
      if (!re.test(value)) return "Le numéro de téléphone n'est pas valide.";
      return null;
    },

    ville(value) {
      if (!value.trim()) return "La ville est obligatoire.";
      if (value.trim().length < 2) return "Veuillez indiquer une ville valide.";
      return null;
    },

    disponibilites(value) {
      // Facultatif — on valide juste si une valeur est choisie
      return null;
    },

    message(value) {
      // Facultatif
      return null;
    }
  };

  /* ─── Validation d'un champ texte/select/textarea ─────────────────── */

  function validateField(field) {
    const rule = validators[field.id];
    if (!rule) return true;

    const error = rule(field.value);
    if (error) {
      setInvalid(field, error);
      return false;
    } else {
      setValid(field);
      return true;
    }
  }

  /* ─── Validation du groupe radio "role" ───────────────────────────── */

  function validateRole() {
    const selected = document.querySelector('input[name="role"]:checked');
    if (!selected) {
      setRadioGroupInvalid("Veuillez choisir votre rôle (bénévole, visiteur ou les deux).");
      return false;
    }
    clearRadioGroupError();
    return true;
  }

  /* ─── Validation de la checkbox RGPD ─────────────────────────────── */

  function validateRgpd() {
    const rgpd = document.getElementById("rgpd");
    if (!rgpd.checked) {
      setCheckboxInvalid(rgpd, "Vous devez accepter l'utilisation de vos données pour continuer.");
      return false;
    }
    setCheckboxValid(rgpd);
    return true;
  }

  /* ─── Validation en temps réel (blur) ─────────────────────────────── */

  // Champs texte / select / textarea
  ["prenom", "nom", "email", "telephone", "ville", "disponibilites", "message"].forEach(id => {
    const field = document.getElementById(id);
    if (!field) return;

    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      // On ne valide en live que si le champ a déjà été "touché"
      if (field.classList.contains("is-invalid") || field.classList.contains("is-valid")) {
        validateField(field);
      }
    });
  });

  // Radio "role"
  document.querySelectorAll('input[name="role"]').forEach(radio => {
    radio.addEventListener("change", validateRole);
  });

  // Checkbox RGPD
  const rgpdEl = document.getElementById("rgpd");
  if (rgpdEl) {
    rgpdEl.addEventListener("change", validateRgpd);
  }

  /* ─── Soumission du formulaire ─────────────────────────────────────── */

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Empêche l'envoi natif

    let isFormValid = true;

    // Valide chaque champ texte/select/textarea
    ["prenom", "nom", "email", "telephone", "ville"].forEach(id => {
      const field = document.getElementById(id);
      if (field && !validateField(field)) isFormValid = false;
    });

    // Valide le groupe radio
    if (!validateRole()) isFormValid = false;

    // Valide la checkbox RGPD
    if (!validateRgpd()) isFormValid = false;

    if (isFormValid) {
      // ✅ Collecte des données
      const data = collectFormData();
      console.log("Formulaire valide — données :", data);

      // Affiche un message de succès
      showSuccessMessage();
    } else {
      // Scroll vers le premier champ invalide
      const firstInvalid = form.querySelector(".is-invalid");
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        firstInvalid.focus();
      }
    }
  });

  /* ─── Collecte des données du formulaire ──────────────────────────── */

  function collectFormData() {
    const competences = [...document.querySelectorAll(
      '#electronique, #couture, #mecanique, #bricolage, #autre-competence'
    )]
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    return {
      prenom:        document.getElementById("prenom").value.trim(),
      nom:           document.getElementById("nom").value.trim(),
      email:         document.getElementById("email").value.trim(),
      telephone:     document.getElementById("telephone").value.trim(),
      ville:         document.getElementById("ville").value.trim(),
      role:          document.querySelector('input[name="role"]:checked')?.value ?? "",
      competences,
      disponibilites: document.getElementById("disponibilites").value,
      message:       document.getElementById("message").value.trim(),
      rgpd:          document.getElementById("rgpd").checked,
    };
  }

  /* ─── Message de succès ───────────────────────────────────────────── */

  function showSuccessMessage() {
    // Supprime un éventuel message précédent
    const existing = document.getElementById("success-alert");
    if (existing) existing.remove();

    const alert = document.createElement("div");
    alert.id = "success-alert";
    alert.className = "alert alert-success mt-4";
    alert.role = "alert";
    alert.innerHTML = `
      <strong>✅ Demande envoyée !</strong>
      Merci de rejoindre le Repair Café. Nous vous contacterons bientôt.
    `;
    form.insertAdjacentElement("afterend", alert);
    alert.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ─── Réinitialisation ────────────────────────────────────────────── */

  form.addEventListener("reset", () => {
    // Petit délai pour laisser le reset natif s'appliquer
    setTimeout(() => {
      form.querySelectorAll(".form-control, .form-select").forEach(resetField);
      document.querySelectorAll('input[name="role"]').forEach(r => {
        r.classList.remove("is-invalid", "is-valid");
      });
      const sectionLabel = [...document.querySelectorAll('.mb-3 > .form-label')]
        .find(el => el.textContent.includes("participer en tant que"));
      if (sectionLabel) sectionLabel.style.color = "";

      const rgpdCb = document.getElementById("rgpd");
      if (rgpdCb) {
        rgpdCb.classList.remove("is-invalid", "is-valid");
        const lbl = document.querySelector('label[for="rgpd"]');
        if (lbl) lbl.style.color = "";
      }

      // Supprime les feedbacks résiduels
      form.querySelectorAll(".invalid-feedback").forEach(el => el.textContent = "");

      // Supprime le message de succès s'il existe
      const successAlert = document.getElementById("success-alert");
      if (successAlert) successAlert.remove();
    }, 0);
  });

});