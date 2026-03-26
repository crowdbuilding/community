-- ============================================================================
-- Seed Data: CommonCity + Vlinderhaven
-- ============================================================================

-- Organization
insert into organizations (id, name) values
  ('00000000-0000-4000-a000-000000000001', 'CommonCity Development');

-- Project: Vlinderhaven
insert into projects (id, organization_id, name, location, tagline, description, brand_primary_color, brand_accent_color, default_theme) values
  ('00000000-0000-4000-b000-000000000001',
   '00000000-0000-4000-a000-000000000001',
   'Vlinderhaven',
   'Centrumeiland, IJburg, Amsterdam',
   'LHBTIQ+ woongemeenschap — 110 woningen',
   'Vlinderhaven is een LHBTIQ+ woongemeenschap op Centrumeiland, IJburg (Amsterdam). Het initiatief is opgezet door outForever en wordt ontwikkeld door CommonCity Development en Zenzo, met Space&Matter als architect en De Alliantie voor sociaal en middelduur huur. Het project won de zelfbouwtender van gemeente Amsterdam in januari 2026. 40% van de 110 woningen wordt sociaal en middelduur huur via De Alliantie, 60% koop en vrije sector. Het ontwerp is multigenerationeel: 20% jonger dan 30, 60% 30-67 jaar, 20% 67+. Bouwstart voorjaar 2027, oplevering 2029.',
   '#7B5EA7',
   '#3BD269',
   'warm');

-- Milestones
insert into milestones (project_id, label, status, sort_order) values
  ('00000000-0000-4000-b000-000000000001', 'Initiatief', 'done', 1),
  ('00000000-0000-4000-b000-000000000001', 'Competitie', 'done', 2),
  ('00000000-0000-4000-b000-000000000001', 'Gunning', 'done', 3),
  ('00000000-0000-4000-b000-000000000001', 'Ontwerp', 'active', 4),
  ('00000000-0000-4000-b000-000000000001', 'Vergunning', 'pending', 5),
  ('00000000-0000-4000-b000-000000000001', 'Bouw', 'pending', 6),
  ('00000000-0000-4000-b000-000000000001', 'Oplevering', 'pending', 7);
