'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  createdAt: Date
}

interface Props {
  users: User[]
  currentUserId: string
  onEdit: (user: User) => void
  onToggleActive: (user: User) => void
}

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin',
  OPERATOR: 'Operador',
  VIEWER: 'Visualizador',
}

export function UserList({ users, currentUserId, onEdit, onToggleActive }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Perfil</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const isSelf = user.id === currentUserId
          return (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{ROLE_LABELS[user.role]}</TableCell>
              <TableCell>
                <Badge
                  variant={user.active ? 'default' : 'secondary'}
                  className={user.active ? 'bg-green-100 text-green-800 border-green-200' : ''}
                >
                  {user.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSelf}
                    onClick={() => onEdit(user)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isSelf}
                    onClick={() => onToggleActive(user)}
                  >
                    {user.active ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
        {users.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
              Nenhum usuário encontrado.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
