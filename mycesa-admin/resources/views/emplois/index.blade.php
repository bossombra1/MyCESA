@extends('layouts.app')
@section('title', 'Emplois du temps — MyCESA')
@section('page-title', 'Emplois du temps')
@section('page-subtitle', 'Fichiers publiés par classe')
@section('content')
<div class="table-card">
    <div class="table-header flex-wrap gap-2">
        <h6 class="table-title"><i class="bi bi-file-earmark-text text-primary me-2"></i>Fichiers actifs</h6>
        <a href="{{ route('emplois-temps.create') }}" class="btn btn-primary"><i class="bi bi-upload me-1"></i> Publier un fichier</a>
    </div>
    @if(count($fichiers) > 0)
        <div class="table-responsive"><table class="table align-middle"><thead><tr><th>Classe</th><th>Fichier actif</th><th>Envoyé le</th><th>Historique</th><th class="text-end">Actions</th></tr></thead><tbody>
        @foreach($fichiers as $g)
            @php
                $actif = $g['actif'] ?? null;
                $historique = $g['historique'] ?? [];
                $mimeActif = $actif['type_mime'] ?? '';
                $apercuActif = str_starts_with($mimeActif, 'image/') || $mimeActif === 'application/pdf';
            @endphp
            <tr>
                <td><span class="badge bg-success bg-opacity-10 text-success">{{ $g['nom_classe'] ?? ('Classe ' . ($g['classe_id'] ?? '')) }}</span></td>
                <td>@if($actif)<i class="bi bi-file-earmark me-2 text-primary"></i>{{ $actif['nom_fichier_original'] ?? '—' }}@else<span class="text-muted">Aucun fichier</span>@endif</td>
                <td class="text-muted small">{{ $actif ? \Carbon\Carbon::parse($actif['created_at'])->format('d/m/Y H:i') : '—' }}</td>
                <td><button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#historique-{{ $g['classe_id'] }}"><i class="bi bi-clock-history me-1"></i>{{ count($historique) }} version(s)</button></td>
                <td class="text-end">
                    @if($actif)
                        @if($apercuActif)
                            <button type="button" class="btn btn-sm btn-light" title="Aperçu"
                                data-bs-toggle="modal" data-bs-target="#modalApercu"
                                data-apercu-url="{{ route('emplois-temps.preview-file', $actif['id']) }}"
                                data-apercu-download="{{ route('emplois-temps.download-file', $actif['id']) }}"
                                data-apercu-name="{{ $actif['nom_fichier_original'] ?? '' }}"
                                data-apercu-type="{{ str_starts_with($mimeActif, 'image/') ? 'image' : 'pdf' }}"><i class="bi bi-eye"></i></button>
                        @endif
                        <a class="btn btn-sm btn-light" href="{{ route('emplois-temps.download-file', $actif['id']) }}" title="Télécharger"><i class="bi bi-download"></i></a>
                        <form class="d-inline" method="POST" action="{{ route('emplois-temps.destroy-file', $actif['id']) }}" onsubmit="return confirm('Supprimer ce fichier actif ?')">@csrf @method('DELETE')<button class="btn btn-sm btn-light text-danger" title="Supprimer"><i class="bi bi-trash"></i></button></form>
                    @endif
                </td>
            </tr>
            <tr class="collapse" id="historique-{{ $g['classe_id'] }}"><td colspan="5"><div class="ps-3">@forelse($historique as $file)
                @php $mimeHisto = $file['type_mime'] ?? ''; $apercuHisto = str_starts_with($mimeHisto, 'image/') || $mimeHisto === 'application/pdf'; @endphp
                <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                    <span class="text-truncate"><i class="bi bi-clock me-2"></i>{{ $file['nom_fichier_original'] }}
                        <small class="text-muted">· {{ \Carbon\Carbon::parse($file['created_at'])->format('d/m/Y H:i') }}</small>
                    </span>
                    <span class="text-nowrap">
                        @if($apercuHisto)
                            <button type="button" class="btn btn-sm btn-link"
                                data-bs-toggle="modal" data-bs-target="#modalApercu"
                                data-apercu-url="{{ route('emplois-temps.preview-file', $file['id']) }}"
                                data-apercu-download="{{ route('emplois-temps.download-file', $file['id']) }}"
                                data-apercu-name="{{ $file['nom_fichier_original'] ?? '' }}"
                                data-apercu-type="{{ str_starts_with($mimeHisto, 'image/') ? 'image' : 'pdf' }}"><i class="bi bi-eye"></i> Aperçu</button>
                        @endif
                        <a href="{{ route('emplois-temps.download-file', $file['id']) }}" class="btn btn-sm btn-link"><i class="bi bi-download"></i> Télécharger</a>
                    </span>
                </div>
            @empty<span class="text-muted small">Aucune version précédente.</span>@endforelse</div></td></tr>
        @endforeach
        </tbody></table></div>
    @else
        <div class="empty-state"><i class="bi bi-file-earmark-x"></i><p>Aucun emploi du temps publié.</p><a href="{{ route('emplois-temps.create') }}" class="btn btn-primary mt-2">Publier le premier fichier</a></div>
    @endif
</div>
{{-- ===================== MODAL APERÇU ===================== --}}
<div class="modal fade" id="modalApercu" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content border-0 shadow" style="border-radius:14px;">
            <div class="modal-header border-0 pb-0 px-4 pt-4">
                <h5 class="modal-title fw-bold text-truncate" id="apercuTitre">Aperçu du fichier</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
            </div>
            <div class="modal-body px-4 py-3">
                <div id="apercuChargement" class="text-center py-5 d-none">
                    <div class="spinner-border text-primary" role="status"></div>
                    <p class="text-muted mt-3 mb-0">Chargement de l’aperçu…</p>
                </div>
                <div id="apercuErreur" class="alert alert-warning mb-0 d-none"></div>
                <img id="apercuImage" src="" alt="Aperçu de l’emploi du temps" class="d-none img-fluid rounded border w-100" style="max-height:70vh;object-fit:contain;">
                <iframe id="apercuPdf" src="about:blank" title="Aperçu PDF" class="d-none w-100 border rounded" style="height:70vh;"></iframe>
            </div>
            <div class="modal-footer border-0 px-4 pb-4">
                <a id="apercuTelecharger" href="#" class="btn btn-light"><i class="bi bi-download me-1"></i> Télécharger</a>
                <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Fermer</button>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
(function () {
    const modal = document.getElementById('modalApercu');
    if (!modal) return;

    const titre       = document.getElementById('apercuTitre');
    const chargement  = document.getElementById('apercuChargement');
    const erreur      = document.getElementById('apercuErreur');
    const image       = document.getElementById('apercuImage');
    const pdf         = document.getElementById('apercuPdf');
    const telecharger = document.getElementById('apercuTelecharger');

    const reinitialiser = () => {
        chargement.classList.add('d-none');
        erreur.classList.add('d-none');
        image.classList.add('d-none');
        pdf.classList.add('d-none');
        image.removeAttribute('src');
        pdf.setAttribute('src', 'about:blank');
    };

    const afficherErreur = (texte) => {
        chargement.classList.add('d-none');
        erreur.textContent = texte;
        erreur.classList.remove('d-none');
    };

    modal.addEventListener('show.bs.modal', function (event) {
        const bouton = event.relatedTarget;
        if (!bouton) return;
        reinitialiser();

        const nom  = bouton.dataset.apercuName || 'Aperçu du fichier';
        const url  = bouton.dataset.apercuUrl;
        const type = bouton.dataset.apercuType;

        titre.textContent = nom;
        telecharger.setAttribute('href', bouton.dataset.apercuDownload || '#');
        chargement.classList.remove('d-none');

        if (!url) {
            afficherErreur('Aperçu indisponible pour ce fichier.');
            return;
        }

        if (type === 'image') {
            image.onload  = function () { chargement.classList.add('d-none'); image.classList.remove('d-none'); };
            image.onerror = function () { afficherErreur('Impossible d’afficher l’image. Utilisez le bouton Télécharger.'); };
            image.src = url;
        } else {
            pdf.src = url + '#toolbar=1&view=FitH';
            // Certains navigateurs n'émettent pas d'événement "load" pour les PDF :
            // on masque le chargeur après un court délai pour ne jamais bloquer l'utilisateur.
            setTimeout(function () { chargement.classList.add('d-none'); pdf.classList.remove('d-none'); }, 700);
        }
    });

    modal.addEventListener('hidden.bs.modal', reinitialiser);
})();
</script>
@endpush
