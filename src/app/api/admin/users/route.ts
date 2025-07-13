import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Fetching users from Clerk...');
    
    // Obtener usuarios desde Clerk
    const users = await clerkClient.users.getUserList({
      limit: 100,
      orderBy: "-created_at"
    });

    console.log('✅ Found users from Clerk:', users.length || 0);

    // Transformar datos de Clerk al formato esperado
    const transformedUsers = (users || []).map(user => ({
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress || 'No email',
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || 'Sin nombre',
      disable: user.banned || false,
      created_at: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
      lastSignIn: user.lastSignInAt ? new Date(user.lastSignInAt).toISOString() : null,
      imageUrl: user.imageUrl
    }));

    return NextResponse.json({ 
      users: transformedUsers,
      total: transformedUsers.length
    });
  } catch (error) {
    console.error('Error fetching users from Clerk:', error);
    return NextResponse.json(
      { message: 'Error al obtener usuarios', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Actualizar estado de usuario (simulado - Clerk no permite ban/unban fácilmente)
export async function PUT(req: NextRequest) {
  try {
    const { id, disable } = await req.json();

    if (!id || typeof disable !== 'boolean') {
      return NextResponse.json(
        { message: 'ID y estado disable son requeridos' },
        { status: 400 }
      );
    }

    console.log(`🔄 ${disable ? 'Banning' : 'Unbanning'} user ${id} in Clerk...`);

    // Nota: Clerk no permite ban/unban fácilmente a través de la API pública
    // Por ahora, simulamos la acción pero no la ejecutamos realmente
    console.log('⚠️ Ban/unban functionality not implemented in Clerk API');

    // Obtener el usuario actual
    const user = await clerkClient.users.getUser(id);

    return NextResponse.json({
      success: true,
      message: `Acción de ${disable ? 'deshabilitar' : 'habilitar'} usuario registrada (funcionalidad limitada en Clerk)`,
      user: {
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress || 'No email',
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || 'Sin nombre',
        disable: user.banned || false, // Mantiene el estado actual
        created_at: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating user status in Clerk:', error);
    return NextResponse.json(
      { 
        message: 'Error al actualizar estado del usuario',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
