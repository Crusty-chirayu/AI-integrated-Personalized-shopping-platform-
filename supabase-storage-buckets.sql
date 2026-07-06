insert into storage.buckets (id, name, public) values
  ('product-images', 'product-images', true),
  ('brand-assets', 'brand-assets', true),
  ('media-library', 'media-library', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;
