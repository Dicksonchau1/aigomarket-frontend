function Sidebar() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-800 bg-slate-950">
      {/* Navigation mapping stays the same, ensure paths match App.jsx */}
    </aside>
  );
}
export default Sidebar;