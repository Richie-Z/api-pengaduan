import { Petugas, Sequelize } from "../database/models/index";
import { hashSync } from "bcrypt";

function createPassword(password) {
  return hashSync(password, 10);
}

const getAll = async (req, res) => {
  try {
    const petugas = await Petugas.findAll();
    res.json({
      status: true,
      data: petugas,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
    });
  }
};
const createOp = async (req, res) => {
  try {
    const { username, password, name } = req.body;
    if (!username && !password) {
      throw {
        status: false,
        message: "Missing field username and password",
      };
    }
    const samePetugas = await Petugas.count({ where: { username: username } });
    if (samePetugas > 0)
      throw {
        status: false,
        message: `Petugas with username '${username}' already exist.`,
      };
    await Petugas.create({
      username,
      password: createPassword(password),
      name,
      role: "operator",
    });
    res.json({
      status: true,
      message: "Create Operator Success.",
      data: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};
const updateOp = async (req, res) => {
  try {
    const { username, password, name } = req.body;
    if (!username && !password) {
      throw {
        status: false,
        message: "Missing field username and password",
      };
    }
    const currentPetugas = await Petugas.findByPk(req.params.petugasID);
    if (!currentPetugas)
      throw {
        status: false,
        message: "Wrong Petugas ID",
      };
    const samePetugas = await Petugas.count({
      where: {
        [Sequelize.Op.and]: [
          { username: username },
          { username: { [Sequelize.Op.not]: currentPetugas.username } },
        ],
      },
    });
    if (samePetugas > 0)
      throw {
        status: false,
        message: `Petugas with username '${username}' already exist.`,
      };
    await currentPetugas.update({
      username,
      password: createPassword(password),
      name,
    });
    res.json({
      status: true,
      message: "Update Operator Success.",
      data: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

const deletePetugas = async (req, res) => {
  try {
    const currentPetugas = await Petugas.findByPk(req.params.petugasID);
    if (!currentPetugas)
      throw {
        status: false,
        message: "Wrong Petugas ID",
      };
    await currentPetugas.destroy();
    res.json({
      status: true,
      message: "Delete Petugas Success.",
      data: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

const detailPetugas = async (req, res) => {
  try {
    const currentPetugas = await Petugas.findByPk(req.params.petugasID, {
      include: "tanggapan",
    });
    if (!currentPetugas)
      throw {
        status: false,
        message: "Wrong Petugas ID",
      };
    res.json({
      status: true,
      data: currentPetugas,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};
export { getAll, createOp, updateOp, deletePetugas, detailPetugas };
