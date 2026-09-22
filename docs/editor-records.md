Clubes mantêm "name" como nome usual apresentado em todo o jogo. "fullName" é opcional.
Campos opcionais do estádio: stadiumCity, stadiumCapacity, stadiumYear, stadiumSurface,
stadiumPhoto. O nome existente continua em stadium. Notas em notes.
Staff: os campos existentes club, role e quality continuam a alimentar o motor.
photo, nation, age, salary e notes são opcionais e informativos.
Imagens novas são convertidas para PNG até 512 px, preservando transparência.
Todos os campos ficam nos registos canónicos, nas exportações e nos snapshots.
Cancelar, fechar ou Escape descartam o formulário sem gravar.

v7: jogadores podem ter `club: null` (Sem clube). O editor regista mudanças de clube em `transferHistory` e versões contratuais anteriores em `contractHistory`. O separador Jogo contém apenas valores de simulação: skills, potencial e AVG calculado. `verificationStatus` e `lastVerifiedAt` são opcionais e não afectam o motor.
