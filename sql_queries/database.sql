

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';


CREATE SCHEMA IF NOT EXISTS `cosmicPortfolio` DEFAULT CHARACTER SET utf8 ;
USE `cosmicPortfolio` ;

-- -----------------------------------------------------
-- Table `cosmicPortfolio`.`star`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cosmicPortfolio`.`star` (
  `starID` INT NOT NULL,
  `Name` VARCHAR(5000) NULL,
  `Description` MEDIUMTEXT NULL,
  `xPosition` FLOAT NULL,
  `yPosition` FLOAT NULL,
  `zPosition` FLOAT NULL,
  `modleName` VARCHAR(5000) NULL,
  `Size` FLOAT NULL,
  `imageURL` VARCHAR(5000) NULL,
  PRIMARY KEY (`starID`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `cosmicPortfolio`.`Constellation`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cosmicPortfolio`.`constellation` (
  `constellationID` INT NOT NULL,
  `Name` VARCHAR(5000) NULL,
  `xPosition` FLOAT NULL,
  `yPosition` FLOAT NULL,
  `zPosition` FLOAT NULL,
  PRIMARY KEY (`constellationID`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `cosmicPortfolio`.`star_has_Constellation`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cosmicPortfolio`.`star_has_constellation` (
  `starID` INT NOT NULL,
  `constellationID` INT NOT NULL,
  PRIMARY KEY (`starID`, `constellationID`),
  INDEX `fk_star_has_constellation_constellation1_idx` (`constellationID` ASC) VISIBLE,
  INDEX `fk_star_has_constellation_star_idx` (`starID` ASC) VISIBLE,
  CONSTRAINT `fk_star_has_constellation_star`
    FOREIGN KEY (`starID`)
    REFERENCES `cosmicPortfolio`.`star` (`starID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_star_has_constellation_constellation1`
    FOREIGN KEY (`constellationID`)
    REFERENCES `cosmicPortfolio`.`constellation` (`constellationID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
