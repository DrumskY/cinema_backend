-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "commentId" SERIAL NOT NULL,
    "comment" VARCHAR(255) NOT NULL,
    "authorId" INTEGER,
    "authorCommId" INTEGER,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("commentId")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "reservationId" SERIAL NOT NULL,
    "reservationNumber" INTEGER NOT NULL,
    "reservationData" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userReservation" INTEGER NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("reservationId")
);

-- CreateTable
CREATE TABLE "Seating" (
    "seatingId" SERIAL NOT NULL,
    "SeatingNumber" INTEGER NOT NULL,
    "seanceFk" INTEGER NOT NULL,
    "reservationNum" INTEGER NOT NULL,
    "cinemaArmchairFk" INTEGER NOT NULL,

    CONSTRAINT "Seating_pkey" PRIMARY KEY ("seatingId")
);

-- CreateTable
CREATE TABLE "Cinema_armchair" (
    "cinemaArmchairId" SERIAL NOT NULL,
    "row" VARCHAR(5) NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,

    CONSTRAINT "Cinema_armchair_pkey" PRIMARY KEY ("cinemaArmchairId")
);

-- CreateTable
CREATE TABLE "Seance" (
    "seanceId" SERIAL NOT NULL,
    "seanceTime" TIMESTAMP(3) NOT NULL,
    "movieShowFk" INTEGER NOT NULL,
    "cinemaHallFk" INTEGER NOT NULL,

    CONSTRAINT "Seance_pkey" PRIMARY KEY ("seanceId")
);

-- CreateTable
CREATE TABLE "Movie" (
    "movieId" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "description" VARCHAR(255) NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("movieId")
);

-- CreateTable
CREATE TABLE "Cinema_hall" (
    "cinemaHallid" SERIAL NOT NULL,
    "hallNumber" INTEGER NOT NULL,

    CONSTRAINT "Cinema_hall_pkey" PRIMARY KEY ("cinemaHallid")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_reservationNumber_key" ON "Reservation"("reservationNumber");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorCommId_fkey" FOREIGN KEY ("authorCommId") REFERENCES "Movie"("movieId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userReservation_fkey" FOREIGN KEY ("userReservation") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seating" ADD CONSTRAINT "Seating_cinemaArmchairFk_fkey" FOREIGN KEY ("cinemaArmchairFk") REFERENCES "Cinema_armchair"("cinemaArmchairId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seating" ADD CONSTRAINT "Seating_reservationNum_fkey" FOREIGN KEY ("reservationNum") REFERENCES "Reservation"("reservationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seating" ADD CONSTRAINT "Seating_seanceFk_fkey" FOREIGN KEY ("seanceFk") REFERENCES "Seance"("seanceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_cinemaHallFk_fkey" FOREIGN KEY ("cinemaHallFk") REFERENCES "Cinema_hall"("cinemaHallid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_movieShowFk_fkey" FOREIGN KEY ("movieShowFk") REFERENCES "Movie"("movieId") ON DELETE RESTRICT ON UPDATE CASCADE;
