export type Photo = {
  id: string;
  created_at: string;
  file_path: string;
  public_url: string;
  guest_name: string | null;
  caption: string | null;
  approved: boolean;
};
