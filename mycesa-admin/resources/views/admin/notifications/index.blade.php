@extends('layouts.admin')
@section('title', 'Notifications — Admin MyCESA')
@section('page-title', 'Centre de Notifications')
@section('page-subtitle', 'Envoyer et gérer les notifications')

@section('content')

{{-- Message flash --}}
@if(session('success'))
  <div class="alert alert-success alert-dismissible fade show">
    {{ session('success') }}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>
@endif
@if(session('error'))
  <div class="alert alert-danger alert-dismissible fade show">
    {{ session('error') }}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>
@endif

<div class="row g-4">

  {{-- COLONNE GAUCHE : Formulaire d'envoi --}}
  <div class="col-lg-5">
    <div class="card border-0 shadow-sm h-100">
      <div class="card-header bg-white border-0 pt-4 pb-0 px-4">
        <h5 class="fw-bold mb-0">
          <i class="bi bi-send-fill text-primary me-2"></i>
          Envoyer une notification
        </h5>
      </div>
      <div class="card-body px-4">
        <form action="{{ route('admin.notifications.store') }}" method="POST"
              id="formNotification">
          @csrf

          {{-- Titre --}}
          <div class="mb-3">
            <label class="form-label fw-semibold">
              Titre <span class="text-danger">*</span>
            </label>
            <input type="text" name="Titre_Notif"
                   class="form-control @error('Titre_Notif') is-invalid @enderror"
                   placeholder="Ex : Rappel de paiement"
                   value="{{ old('Titre_Notif') }}" required>
            @error('Titre_Notif')
              <div class="invalid-feedback">{{ $message }}</div>
            @enderror
          </div>

          {{-- Message --}}
          <div class="mb-3">
            <label class="form-label fw-semibold">
              Message <span class="text-danger">*</span>
            </label>
            <textarea name="Message_Notif" rows="4"
                      class="form-control @error('Message_Notif') is-invalid @enderror"
                      placeholder="Contenu de la notification..."
                      required>{{ old('Message_Notif') }}</textarea>
            @error('Message_Notif')
              <div class="invalid-feedback">{{ $message }}</div>
            @enderror
          </div>

          {{-- Type --}}
          <div class="mb-3">
            <label class="form-label fw-semibold">Type</label>
            <select name="Type" class="form-select" required>
              <option value="academique">🔴 Alerte Académique</option>
              <option value="vie_scolaire">🟠 Vie Scolaire</option>
              <option value="finance">🔵 Finance</option>
              <option value="autre">⚪ Autre</option>
            </select>
          </div>

          {{-- Cible --}}
          <div class="mb-3">
            <label class="form-label fw-semibold">Destinataires</label>
            <select name="Cible" class="form-select" id="selectCible" required>
              <option value="tous">🌍 Tout l'établissement</option>
              <option value="filiere">📚 Par Filière</option>
              <option value="classe">🏫 Par Classe</option>
              <option value="etudiant">👤 Un étudiant</option>
            </select>
          </div>

         {{-- Bloc filière --}}
<div class="mb-3 d-none" id="blocFiliere">
    <label class="form-label fw-semibold">Filière</label>
    <select name="Id_Filiere" class="form-select">
        <option value="">— Choisir —</option>
        @foreach($filieres as $f)
        @php
            $fId  = $f['Id_Filiere'] ?? $f['id'] ?? $f['ID'] ?? $f['Id'] ?? null;
            $fNom = $f['Nom_Filiere'] ?? $f['nom'] ?? $f['Nom'] ?? $f['libelle'] ?? 'Filière '.$loop->iteration;
        @endphp
        @if($fId)
        <option value="{{ $fId }}">{{ $fNom }}</option>
        @endif
        @endforeach
    </select>
</div>

{{-- Bloc classe --}}
<div class="mb-3 d-none" id="blocClasse">
    <label class="form-label fw-semibold">Classe</label>
    <select name="Id_Classe" class="form-select">
        <option value="">— Choisir —</option>
        @foreach($classes as $c)
        @php
            $cId  = $c['Id_Classe'] ?? $c['id'] ?? $c['ID'] ?? $c['Id'] ?? null;
            $cNom = $c['Nom_Classe'] ?? $c['nom'] ?? $c['Nom'] ?? $c['libelle'] ?? 'Classe '.$loop->iteration;
        @endphp
        @if($cId)
        <option value="{{ $cId }}">{{ $cNom }}</option>
        @endif
        @endforeach
    </select>
</div>

          {{-- Bloc étudiant --}}
          <div class="mb-3 d-none" id="blocEtudiant">
            <label class="form-label fw-semibold">ID Étudiant</label>
            <input type="number" name="Id_Etudiant"
                   class="form-control"
                   placeholder="Entrer l'ID de l'étudiant">
            <div class="form-text text-muted">
              Consultez la liste des étudiants pour trouver l'ID.
            </div>
          </div>

          {{-- Toggle envoi différé --}}
          <div class="mb-3">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox"
                     id="toggleDiffere">
              <label class="form-check-label" for="toggleDiffere">
                Programmer pour plus tard
              </label>
            </div>
          </div>

          {{-- Bloc date programmée --}}
          <div class="mb-4 d-none" id="blocScheduled">
            <label class="form-label fw-semibold">Date d'envoi</label>
            <input type="datetime-local" name="Scheduled_At"
                   class="form-control">
          </div>

          <button type="submit" class="btn btn-primary w-100 fw-semibold"
                  id="btnEnvoyer">
            <span class="spinner-border spinner-border-sm me-2 d-none"
                  id="spinnerEnvoi"></span>
            <i class="bi bi-send me-2" id="iconEnvoi"></i>
            Envoyer la notification
          </button>
        </form>
      </div>
    </div>
  </div>

  {{-- COLONNE DROITE : Historique --}}
  <div class="col-lg-7">
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white border-0 pt-4 pb-0 px-4
                  d-flex justify-content-between align-items-center">
        <h5 class="fw-bold mb-0">
          <i class="bi bi-clock-history text-secondary me-2"></i>
          Historique des envois
        </h5>
        <span class="badge bg-secondary">
          {{ count($notifications) }} notification(s)
        </span>
      </div>
      <div class="card-body p-0">
        @if(count($notifications) > 0)
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="px-4">Titre</th>
                <th>Type</th>
                <th>Cible</th>
                <th class="text-center">Destinataires</th>
                <th>Statut</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @foreach($notifications as $notif)
              @php
                $type  = $notif['Type'] ?? 'autre';
                $cible = $notif['Cible'] ?? 'tous';
                $typeBadges = [
                  'academique'  => ['bg-danger',  'Académique'],
                  'vie_scolaire'=> ['bg-warning text-dark', 'Vie scolaire'],
                  'finance'     => ['bg-primary', 'Finance'],
                  'autre'       => ['bg-secondary','Autre'],
                ];
                [$badgeClass, $badgeLabel] =
                  $typeBadges[$type] ?? $typeBadges['autre'];

                $cibleLabels = [
                  'tous'     => ['🌍', 'Tous'],
                  'filiere'  => ['📚', 'Filière'],
                  'classe'   => ['🏫', 'Classe'],
                  'etudiant' => ['👤', 'Étudiant'],
                ];
                [$cibleIcon, $cibleLabel] =
                  $cibleLabels[$cible] ?? ['📢', $cible];

                $sentAt      = $notif['Sent_At'] ?? null;
                $scheduledAt = $notif['Scheduled_At'] ?? null;
              @endphp
              <tr>
                <td class="px-4">
                  <div class="fw-semibold" style="font-size:.9rem;">
                    {{ $notif['Titre_Notif'] ?? '—' }}
                  </div>
                  <div class="text-muted"
                       style="font-size:.78rem;max-width:200px;
                              overflow:hidden;text-overflow:ellipsis;
                              white-space:nowrap;">
                    {{ $notif['Message_Notif'] ?? '' }}
                  </div>
                </td>
                <td>
                  <span class="badge {{ $badgeClass }}">
                    {{ $badgeLabel }}
                  </span>
                </td>
                <td>
                  {{ $cibleIcon }} {{ $cibleLabel }}
                </td>
                <td class="text-center">
                  <span class="fw-bold">
                    {{ $notif['total_recipients'] ?? 0 }}
                  </span>
                  <div class="text-muted" style="font-size:.75rem;">
                    {{ $notif['total_lus'] ?? 0 }} lus
                  </div>
                </td>
                <td>
                  @if($sentAt)
                    <span class="badge bg-success">Envoyé</span>
                  @elseif($scheduledAt)
                    <span class="badge bg-warning text-dark">
                      Programmé
                    </span>
                    <div class="text-muted" style="font-size:.72rem;">
                      {{ \Carbon\Carbon::parse($scheduledAt)
                         ->format('d/m/Y H:i') }}
                    </div>
                  @else
                    <span class="badge bg-secondary">Brouillon</span>
                  @endif
                </td>
                <td style="font-size:.8rem;color:#64748b;">
                  {{ \Carbon\Carbon::parse(
                     $notif['Date_Notif'] ?? now()
                   )->format('d/m/Y') }}
                </td>
                <td>
                  <form
                    action="{{ route('admin.notifications.destroy',
                              $notif['id']) }}"
                    method="POST"
                    onsubmit="return confirm(
                      'Supprimer cette notification et tous ses destinataires ?'
                    )">
                    @csrf @method('DELETE')
                    <button class="btn btn-sm btn-outline-danger"
                            title="Supprimer">
                      <i class="bi bi-trash"></i>
                    </button>
                  </form>
                </td>
              </tr>
              @endforeach
            </tbody>
          </table>
        </div>
        @else
        <div class="text-center py-5 text-muted">
          <i class="bi bi-bell-slash"
             style="font-size:2.5rem;"></i>
          <p class="mt-3 mb-0">Aucune notification envoyée</p>
        </div>
        @endif
      </div>
    </div>
  </div>
</div>

@endsection

@push('scripts')
<script>
// Affichage conditionnel selon la cible
const selectCible  = document.getElementById('selectCible');
const blocFiliere  = document.getElementById('blocFiliere');
const blocClasse   = document.getElementById('blocClasse');
const blocEtudiant = document.getElementById('blocEtudiant');

function updateCibleBlocs() {
  blocFiliere.classList.add('d-none');
  blocClasse.classList.add('d-none');
  blocEtudiant.classList.add('d-none');
  const val = selectCible.value;
  if (val === 'filiere')  blocFiliere.classList.remove('d-none');
  if (val === 'classe')   blocClasse.classList.remove('d-none');
  if (val === 'etudiant') blocEtudiant.classList.remove('d-none');
}
selectCible.addEventListener('change', updateCibleBlocs);

// Toggle envoi différé
const toggleDiffere  = document.getElementById('toggleDiffere');
const blocScheduled  = document.getElementById('blocScheduled');
toggleDiffere.addEventListener('change', function() {
  blocScheduled.classList.toggle('d-none', !this.checked);
});

// Spinner sur submit
document.getElementById('formNotification')
  .addEventListener('submit', function() {
    document.getElementById('spinnerEnvoi')
      .classList.remove('d-none');
    document.getElementById('iconEnvoi')
      .classList.add('d-none');
    document.getElementById('btnEnvoyer').disabled = true;
  });
</script>
@endpush