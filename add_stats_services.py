import sys
import os

services_path = r"D:\MyCESA\MyCESA_Admin\src\services\index.js"

# Read current content
with open(services_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the statistiques service line
old_line = "export const statistiquesService = { get: () => api.get('/statistiques') };"
new_lines = '''export const statistiquesService = { get: () => api.get('/statistiques') };
export const statsParFiliereService = { get: () => api.get('/stats/parFiliere') };
export const statsParCycleService = { get: () => api.get('/stats/parCycle') };
export const statsParClasseService = { get: () => api.get('/stats/parClasse') };
export const statsParGenreService = { get: () => api.get('/stats/parGenre') };
export const statsParRoleService = { get: () => api.get('/stats/parRole') };'''

if old_line in content:
    content = content.replace(old_line, new_lines)
    with open(services_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✓ Services mis à jour")
else:
    print("✗ Ligne non trouvée")
