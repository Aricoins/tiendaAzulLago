export const shuffleArray = <T>(array: T[]): T[] => {
    const shuffledArray = [...array]; // Create a copy of the original array
    
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements randomly
    }
  
    return shuffledArray;
  };

  // Lista de administradores por email (más simple y confiable)
  const ADMIN_EMAILS = [
    'admin@azullago.com',
    'ariel@azullago.com',
    'administrador@azullago.com',
    'arielrogeldev@gmail.com', // Administrador agregado
    // Agregar más emails de administradores aquí
  ];

  // Función mejorada para verificar roles de usuario
  export function checkUserRole(session: any) {
    if (!session || !session.user) {
      return null;
    }

    // Método 1: Verificar por organizationMemberships (si está configurado)
    if (session.user.organizationMemberships && session.user.organizationMemberships.length > 0) {
      for (const membership of session.user.organizationMemberships) {
        if (membership.role) {
          return membership.role.toLowerCase();
        }
      }
    }

    // Método 2: Verificar por publicMetadata
    if (session.user.publicMetadata?.role) {
      return session.user.publicMetadata.role.toLowerCase();
    }

    return null;
  }

  // Función específica para verificar si un usuario es administrador
  export function isUserAdmin(session: any, user: any) {
    if (!session && !user) {
      return false;
    }

    // Método 1: Verificar por rol usando checkUserRole
    const userRole = checkUserRole(session);
    if (userRole === 'admin' || userRole === 'administrator') {
      return true;
    }

    // Método 2: Verificar por publicMetadata en el objeto user
    if (user?.publicMetadata?.role === 'admin' || user?.publicMetadata?.role === 'administrator') {
      return true;
    }

    // Método 3: Verificar por email en la lista de administradores
    const userEmail = user?.primaryEmailAddress?.emailAddress || 
                     user?.emailAddresses?.[0]?.emailAddress ||
                     session?.user?.emailAddresses?.[0]?.emailAddress;
    
    if (userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
      return true;
    }

    // Método 4: Verificar por ID específico (como fallback temporal)
    const userId = user?.id || session?.user?.id;
    if (userId && process.env.NEXT_PUBLIC_ADMIN_USER_ID && userId === process.env.NEXT_PUBLIC_ADMIN_USER_ID) {
      return true;
    }

    return false;
  }

  // Función para obtener información detallada del usuario para debugging
  export function getUserInfo(session: any, user: any) {
    return {
      userId: user?.id || session?.user?.id,
      email: user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress,
      role: checkUserRole(session),
      publicMetadata: user?.publicMetadata,
      organizationMemberships: session?.user?.organizationMemberships,
      isAdmin: isUserAdmin(session, user)
    };
  }
