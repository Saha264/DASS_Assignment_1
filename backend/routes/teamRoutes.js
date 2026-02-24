import express from 'express';
import {
    createTeam,
    joinTeam,
    getMyTeams,
    getTeamDetails
} from '../controllers/teamController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('Participant'), createTeam)
    .get(protect, authorize('Participant'), getMyTeams);

router.post('/join', protect, authorize('Participant'), joinTeam);

router.get('/:id', protect, authorize('Participant'), getTeamDetails);

export default router;
