import { sql } from "@vercel/postgres";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { rows } = await sql`
      SELECT id, email, disable, created_at 
      FROM users 
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ 
      users: rows,
      total: rows.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

// Actualizar estado de usuario
export async function PUT(req: NextRequest) {
  try {
    const { id, disable } = await req.json();

    if (!id || typeof disable !== 'boolean') {
      return NextResponse.json(
        { message: 'ID y estado disable son requeridos' },
        { status: 400 }
      );
    }

    const { rows } = await sql`
      UPDATE users 
      SET disable = ${disable}
      WHERE id = ${id}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Usuario actualizado exitosamente",
      user: rows[0]
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Error al actualizar usuario', error: error.message },
      { status: 500 }
    );
  }
}
