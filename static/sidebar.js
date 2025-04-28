document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');

    // Toggle sidebar when clicking the button
    sidebarToggle.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event from bubbling up
        sidebar.classList.toggle('active');
        sidebarToggle.classList.toggle('active');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (!sidebar.contains(e.target) && 
            !sidebarToggle.contains(e.target)) {
            sidebar.classList.remove('active');
            sidebarToggle.classList.remove('active');
        }
    });

    // Prevent clicks inside sidebar from closing it
    sidebar.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});