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

    console.log('✅ Found users from Clerk:', users.data?.length || 0);

    // Transformar datos de Clerk al formato esperado
    const transformedUsers = (users.data || []).map(user => ({
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || 'No email',
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

// Actualizar estado de usuario (ban/unban en Clerk)
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

    // Banear o desbanear usuario en Clerk
    if (disable) {
      await clerkClient.users.banUser(id);
      console.log('✅ User banned successfully');
    } else {
      await clerkClient.users.unbanUser(id);
      console.log('✅ User unbanned successfully');
    }

    // Obtener el usuario actualizado
    const updatedUser = await clerkClient.users.getUser(id);

    return NextResponse.json({
      success: true,
      message: `Usuario ${disable ? 'deshabilitado' : 'habilitado'} correctamente`,
      user: {
        id: updatedUser.id,
        email: updatedUser.primaryEmailAddress?.emailAddress || 'No email',
        name: updatedUser.firstName && updatedUser.lastName ? `${updatedUser.firstName} ${updatedUser.lastName}` : updatedUser.username || 'Sin nombre',
        disable: updatedUser.banned || false,
        created_at: updatedUser.createdAt ? new Date(updatedUser.createdAt).toISOString() : new Date().toISOString()
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
