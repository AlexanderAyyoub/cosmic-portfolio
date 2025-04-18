-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema cosmicPortfolio
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema cosmicPortfolio
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `cosmicPortfolio` DEFAULT CHARACTER SET utf8 ;
USE `cosmicPortfolio` ;

-- -----------------------------------------------------
-- Table `cosmicPortfolio`.`star`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `cosmicPortfolio`.`star`;

CREATE TABLE IF NOT EXISTS `cosmicPortfolio`.`star` (
  `starID` INT NOT NULL,
  `Name` VARCHAR(1000) NULL,
  `Description` MEDIUMTEXT NULL,
  `xPosition` FLOAT NULL,
  `yPosition` FLOAT NULL,
  `zPosition` FLOAT NULL,
  `modleName` VARCHAR(1000) NULL,
  `Size` FLOAT NULL,
  `imageURL` VARCHAR(1000) NULL,
  `color1` CHAR(7) NULL, 
  `color2` CHAR(7) NULL,
  `color3` CHAR(7) NULL,
  `color4` CHAR(7) NULL,
  `solarFlareGIF` VARCHAR(1000) NULL, 
  PRIMARY KEY (`starID`)
)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `cosmicPortfolio`.`Constellation`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cosmicPortfolio`.`Constellation` (
  `constellationID` INT NOT NULL,
  `Name` VARCHAR(45) NULL,
  `xPosition` FLOAT NULL,
  `yPosition` FLOAT NULL,
  `zPosition` FLOAT NULL,
  PRIMARY KEY (`constellationID`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `cosmicPortfolio`.`star_has_Constellation`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cosmicPortfolio`.`star_has_Constellation` (
  `starID` INT NOT NULL,
  `constellationID` INT NOT NULL,
  PRIMARY KEY (`starID`, `constellationID`),
  INDEX `fk_star_has_Constellation_Constellation1_idx` (`constellationID` ASC) VISIBLE,
  INDEX `fk_star_has_Constellation_star_idx` (`starID` ASC) VISIBLE,
  CONSTRAINT `fk_star_has_Constellation_star`
    FOREIGN KEY (`starID`)
    REFERENCES `cosmicPortfolio`.`star` (`starID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_star_has_Constellation_Constellation1`
    FOREIGN KEY (`constellationID`)
    REFERENCES `cosmicPortfolio`.`Constellation` (`constellationID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
