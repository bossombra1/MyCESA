{{--
    Partial : _form.blade.php
    Utilisé par le modal Créer ET le modal Éditer.
    La variable $edit (bool) est optionnelle.
--}}

<div class="row g-3">
    {{-- Titre --}}
    <div class="col-12">
        <label class="form-label fw-semibold" style="font-size:.85rem;">
            Titre <span class="text-danger">*</span>
        </label>
        <input type="text"
               name="Titre"
               class="form-control"
               placeholder="Ex : Examen de Marketing"
               required>
    </div>

    {{-- Description --}}
    <div class="col-12">
        <label class="form-label fw-semibold" style="font-size:.85rem;">Description</label>
        <textarea name="Description"
                  class="form-control"
                  rows="3"
                  placeholder="Détails de l'événement, salle, consignes…"></textarea>
    </div>

    {{-- Date + Heure --}}
    <div class="col-md-6">
        <label class="form-label fw-semibold" style="font-size:.85rem;">
            Date et heure <span class="text-danger">*</span>
        </label>
        <input type="datetime-local"
               name="Date_Evenement"
               class="form-control"
               required>
    </div>

    {{-- Type --}}
    <div class="col-md-6">
        <label class="form-label fw-semibold" style="font-size:.85rem;">
            Type <span class="text-danger">*</span>
        </label>
        <select name="Type" class="form-select" required>
            <option value="">— Choisir —</option>
            <option value="examen">Examen</option>
            <option value="cours">Cours</option>
            <option value="reunion">Réunion</option>
            <option value="sortie">Sortie / Événement</option>
            <option value="autre">Autre</option>
        </select>
    </div>

    {{-- Pour_Tous toggle --}}
    <div class="col-12">
        <div class="p-3 rounded-3" style="background:#f0fdf4;border:1px solid #bbf7d0;">
            <div class="form-check form-switch">
                <input class="form-check-input"
                       type="checkbox"
                       name="Pour_Tous"
                       id="{{ isset($edit) && $edit ? 'pourTousEdit' : 'pourTousCreate' }}"
                       value="1">
                <label class="form-check-label fw-semibold text-success"
                       for="{{ isset($edit) && $edit ? 'pourTousEdit' : 'pourTousCreate' }}"
                       style="font-size:.85rem;">
                    <i class="bi bi-globe me-1"></i>
                    Diffuser à tout l'établissement
                </label>
            </div>
            <p class="text-muted mb-0 mt-1" style="font-size:.78rem;">
                Si activé, tous les étudiants verront cet événement, quelle que soit leur filière ou classe.
            </p>
        </div>
    </div>

    {{-- Cible spécifique (masquée si Pour_Tous coché) --}}
    <div class="col-12 cible-specifique">
        <div class="p-3 rounded-3" style="background:#f8fafc;border:1px dashed #cbd5e1;">
            <p class="text-muted fw-semibold mb-2" style="font-size:.82rem;">
                <i class="bi bi-funnel me-1"></i>Ciblage spécifique (optionnel)
            </p>
            <div class="row g-2">
                <div class="col-md-6">
                    <label class="form-label" style="font-size:.8rem;color:#64748b;">
                        Filière
                    </label>
                    <select name="Id_Filiere" class="form-select form-select-sm">
                        <option value="">Toutes les filières</option>
                        @foreach($filieres as $filiere)
                            @php
                                $filiereId = $filiere['Id_FILIERE'] ?? $filiere['Id_Filiere'] ?? '';
                                $filiereLabel = $filiere['Nom_Filiere'] ?? $filiere['Nom_Filiere'] ?? 'Filière '.$filiereId;
                            @endphp
                            <option value="{{ $filiereId }}" {{ old('Id_Filiere') == $filiereId ? 'selected' : '' }}>
                                {{ $filiereLabel }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label" style="font-size:.8rem;color:#64748b;">
                        Classe
                    </label>
                    <select name="Id_Classe" class="form-select form-select-sm">
                        <option value="">Toutes les classes</option>
                        @foreach($classes as $classe)
                            @php
                                $classeId = $classe['Id_CLASSE'] ?? $classe['Id_Classe'] ?? '';
                                $classeLabel = $classe['Nom_Classe'] ?? $classe['Nom_Classe'] ?? 'Classe '.$classeId;
                            @endphp
                            <option value="{{ $classeId }}" {{ old('Id_Classe') == $classeId ? 'selected' : '' }}>
                                {{ $classeLabel }}
                            </option>
                        @endforeach
                    </select>
                </div>
            </div>
            <p class="text-muted mb-0 mt-2" style="font-size:.75rem;">
                Vous pouvez cibler une filière, une classe, ou les deux à la fois.
            </p>
        </div>
    </div>
</div>